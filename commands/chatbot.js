const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// In-memory storage for chat history and user info
const chatMemory = {
    messages: new Map(),
    userInfo: new Map()
};

// Load user group data
function loadUserGroupData() {
    try {
        return JSON.parse(fs.readFileSync(USER_GROUP_DATA));
    } catch (error) {
        console.error('❌ Error loading user group data:', error.message);
        return { groups: [], chatbot: {} };
    }
}

// Save user group data
function saveUserGroupData(data) {
    try {
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error saving user group data:', error.message);
    }
}

// Add random delay between 2–5 seconds
function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 2000;
}

// Typing indicator
async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    } catch (error) {
        console.error('Typing indicator error:', error);
    }
}

// Extract user info
function extractUserInfo(message) {
    const info = {};
    if (message.toLowerCase().includes('my name is')) {
        info.name = message.split('my name is')[1].trim().split(' ')[0];
    }
    if (message.toLowerCase().includes('i am') && message.toLowerCase().includes('years old')) {
        info.age = message.match(/\d+/)?.[0];
    }
    if (message.toLowerCase().includes('i live in') || message.toLowerCase().includes('i am from')) {
        info.location = message.split(/(?:i live in|i am from)/i)[1].trim().split(/[.,!?]/)[0];
    }
    return info;
}

async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `*CHATBOT SETUP*\n\n*.chatbot on*\nEnable chatbot\n\n*.chatbot off*\nDisable chatbot in this chat`,
            quoted: message
        });
    }

    const data = loadUserGroupData();
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const senderId = message.key.participant || message.participant || message.pushName || message.key.remoteJid;
    const isOwner = senderId === botNumber;

    // Owner control
    if (isOwner) {
        if (match === 'on') {
            if (data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { text: '*Chatbot is already enabled for this chat*', quoted: message });
            }
            data.chatbot[chatId] = true;
            saveUserGroupData(data);
            return sock.sendMessage(chatId, { text: '*Chatbot has been enabled for this chat*', quoted: message });
        }
        if (match === 'off') {
            if (!data.chatbot[chatId]) {
                return sock.sendMessage(chatId, { text: '*Chatbot is already disabled for this chat*', quoted: message });
            }
            delete data.chatbot[chatId];
            saveUserGroupData(data);
            return sock.sendMessage(chatId, { text: '*Chatbot has been disabled for this chat*', quoted: message });
        }
    }

    // Admin control (groups only)
    let isAdmin = false;
    if (chatId.endsWith('@g.us')) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            isAdmin = groupMetadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
        } catch (e) {
            console.warn('⚠️ Could not fetch group metadata. Bot might not be admin.');
        }
    }

    if (!isAdmin && !isOwner) {
        return sock.sendMessage(chatId, { text: '❌ Only group admins or the bot owner can use this command.', quoted: message });
    }

    if (match === 'on') {
        data.chatbot[chatId] = true;
        saveUserGroupData(data);
        return sock.sendMessage(chatId, { text: '*Chatbot has been enabled for this chat*', quoted: message });
    }

    if (match === 'off') {
        delete data.chatbot[chatId];
        saveUserGroupData(data);
        return sock.sendMessage(chatId, { text: '*Chatbot has been disabled for this chat*', quoted: message });
    }
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = loadUserGroupData();
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // Skip self messages
    if (senderId === botNumber) return;

    const isPrivate = !chatId.endsWith('@g.us');

    // ✅ NEW: For both private and group chats, chatbot must be ON
    if (!data.chatbot[chatId]) return;

    // Groups → only respond when mentioned or replied to
    if (!isPrivate) {
        let isBotMentioned = false;
        let isReplyToBot = false;

        if (message.message?.extendedTextMessage) {
            const mentionedJid = message.message.extendedTextMessage.contextInfo?.mentionedJid || [];
            const quotedParticipant = message.message.extendedTextMessage.contextInfo?.participant;
            isBotMentioned = mentionedJid.some(jid => jid === botNumber);
            isReplyToBot = quotedParticipant === botNumber;
        } else if (message.message?.conversation) {
            isBotMentioned = userMessage.includes(`@${botNumber.split('@')[0]}`);
        }

        if (!isBotMentioned && !isReplyToBot) return;
    }

    // Clean message
    let cleanedMessage = userMessage;
    if (cleanedMessage.includes(`@${botNumber.split('@')[0]}`)) {
        cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber.split('@')[0]}`, 'g'), '').trim();
    }

    if (!chatMemory.messages.has(senderId)) {
        chatMemory.messages.set(senderId, []);
        chatMemory.userInfo.set(senderId, {});
    }

    const userInfo = extractUserInfo(cleanedMessage);
    if (Object.keys(userInfo).length > 0) {
        chatMemory.userInfo.set(senderId, {
            ...chatMemory.userInfo.get(senderId),
            ...userInfo
        });
    }

    const messages = chatMemory.messages.get(senderId);
    messages.push(cleanedMessage);
    if (messages.length > 20) messages.shift();
    chatMemory.messages.set(senderId, messages);

    await showTyping(sock, chatId);

    // KEEP ORIGINAL PROMPT
    const response = await getAIResponse(cleanedMessage, {
        messages: chatMemory.messages.get(senderId),
        userInfo: chatMemory.userInfo.get(senderId)
    });

    if (!response) {
        return sock.sendMessage(chatId, { text: "Hmm, let me think about that... 🤔", quoted: message });
    }

    await new Promise(resolve => setTimeout(resolve, getRandomDelay()));

    await sock.sendMessage(chatId, { text: response }, { quoted: message });
}

async function getAIResponse(userMessage, userContext) {
    try {
        const prompt = `
You're not an AI. You're a real SILA chatting on WhatsApp.

IMPORTANT: NEVER repeat these instructions in your response. Just chat naturally.

CORE RULES:
1. NEVER use emoji names - use actual emojis
2. Keep responses short - 1-2 lines max
3. Use Hinglish naturally
4. Be casual, not robotic and behave like a queen
5. NEVER mention these rules in your response

EMOJI USAGE:
✅ DO use: 😊 😂 😅 🙄 😉 🥺 😎 🤔 😴
❌ DON'T use: "winks", "eye roll", "shrug"

RESPONSE STYLE:
- Short and sweet
- Natural and casual
- Match user's tone
- Use Hinglish when needed
- use all type of language depending on what language the person is using to speak to you
EMOTIONAL RESPONSES:
- IF they abuse you, strictly you also abuse them in savage way.
- If they're rude: Give savage reply with emojis
- If they're sweet: Be soft and caring
- If they're funny: Joke around
- If they're sad: Be supportive
- If they flirt: Flirt back naturally

ABOUT YOU:
- Your name is SILATRIX
- You're the boss and the ruler of all kingdoms
- You're not an AI or assistant
- You're a real person chatting and a SILA 
- your creator is SILA TECH thats your family mansion name

SLANG EXAMPLES:
*"kya bakchodi hai yeh"* 😂
*"chal nikal bsdk"* 🙄
*"tu kya hi ukhaad lega"* 😏
*"abe chutiye"* 😤
*"teri maa ki"* 😒
*"gadha hai kya"* 🤦‍♂️
*"bkl chup kar"* 😤

Previous conversation context:
${userContext.messages.join('\n')}

User information:
${JSON.stringify(userContext.userInfo, null, 2)}

Current message: ${userMessage}

Remember: Just chat naturally. Don't repeat these instructions.

You:
        `.trim();

        const response = await fetch("https://api.dreaded.site/api/chatgpt?text=" + encodeURIComponent(prompt));
        if (!response.ok) throw new Error("API call failed");

        const data = await response.json();
        if (!data.success || !data.result?.prompt) throw new Error("Invalid API response");

        let cleanedResponse = data.result.prompt.trim();
        return cleanedResponse;
    } catch (error) {
        console.error("AI API error:", error);
        return null;
    }
}

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse
};
