const fs = require('fs');
const path = require('path');

// Diverse set of emojis for reactions
const commandEmojis = ['⏳','❤️', '🔥', '🎯', '👑', '🤖', '💡'];

// Path for storing auto-reaction state
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Load auto-reaction state from file
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return {
                global: data.autoReaction?.global || false,
                chats: data.autoReaction?.chats || {}
            };
        }
    } catch (error) {
        console.error('Error loading auto-reaction state:', error);
    }
    return { global: false, chats: {} };
}

// Save auto-reaction state to file
function saveAutoReactionState(state) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        data.autoReaction = state;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving auto-reaction state:', error);
    }
}

// Store auto-reaction state locally
let isAutoReactionEnabled = loadAutoReactionState();

function getRandomEmoji() {
    return commandEmojis[Math.floor(Math.random() * commandEmojis.length)];
}

// Function to add reaction to a command message
async function addCommandReaction(sock, message) {
    try {
        const chatId = message.key.remoteJid;
        const shouldReact = isAutoReactionEnabled.global || isAutoReactionEnabled.chats[chatId];
        
        if (!shouldReact || !message?.key?.id) return;
        
        const emoji = getRandomEmoji();
        await sock.sendMessage(chatId, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error adding command reaction:', error);
    }
}

// Function to handle areact command
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner!',
                quoted: message
            });
            return;
        }

        const text = message.message?.extendedTextMessage?.text || 
                    message.message?.conversation || '';
        const args = text.split(' ');
        const action = args[1]?.toLowerCase();
        const target = args[2]; // Optional chat ID for specific chat control

        if (action === 'on') {
            if (target) {
                isAutoReactionEnabled.chats[target] = true;
            } else {
                isAutoReactionEnabled.global = true;
            }
            saveAutoReactionState(isAutoReactionEnabled);
            await sock.sendMessage(chatId, { 
                text: target 
                    ? `✅ Auto-reactions enabled for chat: ${target}`
                    : '✅ Auto-reactions enabled globally',
                quoted: message
            });
        } else if (action === 'off') {
            if (target) {
                isAutoReactionEnabled.chats[target] = false;
            } else {
                isAutoReactionEnabled.global = false;
            }
            saveAutoReactionState(isAutoReactionEnabled);
            await sock.sendMessage(chatId, { 
                text: target 
                    ? `✅ Auto-reactions disabled for chat: ${target}`
                    : '✅ Auto-reactions disabled globally',
                quoted: message
            });
        } else {
            const globalState = isAutoReactionEnabled.global ? 'enabled' : 'disabled';
            let response = `Global auto-reactions: ${globalState}\n\n`;
            response += 'Usage:\n.areact on [chatId] - Enable\n.areact off [chatId] - Disable';
            
            await sock.sendMessage(chatId, { 
                text: response,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error controlling auto-reactions',
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand
};