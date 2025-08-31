const fs = require('fs');
const path = require('path');

// ====== FORWARDING INFO ======
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '0029Vb77pP4A89Mje20udJ32@newsletter',
            newsletterName: ' SILATRIX MD',
            serverMessageId: -1
        }
    }
};

// ====== CONFIG FILE ======
const configPath = path.join(__dirname, '../data/autoStatus.json');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

// ====== COMMAND ======
async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        if (!msg.key.fromMe) {
            return sock.sendMessage(chatId, { text: '❌ This command can only be used by the owner!', ...channelInfo });
        }

        let config = JSON.parse(fs.readFileSync(configPath));

        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled' : 'disabled';
            return sock.sendMessage(chatId, { 
                text: `🔄 *Auto Forward on Status Reply*\n\nCurrent status: ${status}\n\nUse:\n.autostatus on - Enable forward on reply\n.autostatus off - Disable forward on reply`,
                ...channelInfo
            });
        }

        const command = args[0].toLowerCase();
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            return sock.sendMessage(chatId, { text: '✅ Auto forward on status reply enabled!', ...channelInfo });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            return sock.sendMessage(chatId, { text: '❌ Auto forward on status reply disabled!', ...channelInfo });
        } else {
            return sock.sendMessage(chatId, { 
                text: '❌ Invalid command! Use:\n.autostatus on - Enable forward on reply\n.autostatus off - Disable forward on reply',
                ...channelInfo
            });
        }
    } catch (error) {
        console.error('Error in autostatus command:', error);
        sock.sendMessage(chatId, { text: '❌ Error: ' + error.message, ...channelInfo });
    }
}

// ====== CHECK CONFIG ======
function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking config:', error);
        return false;
    }
}

// ====== HANDLE REPLY TO STATUS ======
async function handleStatusUpdate(sock, update) {
    try {
        if (!isAutoStatusEnabled()) return;

        if (update.messages && update.messages.length > 0) {
            const msg = update.messages[0];

            // ✅ Check if this message is a reply to a status
            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage &&
                msg.message?.extendedTextMessage?.contextInfo?.remoteJid === 'status@broadcast') {

                const originalStatus = msg.message.extendedTextMessage.contextInfo.quotedMessage;
                const replyText = msg.message.extendedTextMessage.text || 'send';

                // Get the person who posted the status
                const statusOwner = msg.key.participant; // JID of the status owner

                if (!statusOwner) return console.log("⚠️ Could not determine status owner");

                // Send both status & reply in one message to that person's DM
                await sock.sendMessage(statusOwner, { forward: originalStatus });
                if (replyText.trim() !== '') {
                    await sock.sendMessage(statusOwner, { text: `💬 My reply: ${replyText}` });
                }

                console.log(`📤 Sent stolen status + reply to ${statusOwner}`);
            }
        }
    } catch (error) {
        console.error('❌ Error in reply-to-status forward:', error.message);
    }
}

module.exports = { autoStatusCommand, handleStatusUpdate };
