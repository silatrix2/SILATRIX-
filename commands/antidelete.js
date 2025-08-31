const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

const messageStore = new Map();
const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');

// Ensure tmp dir exists
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

// Function to get folder size in MB
const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        let totalSize = 0;

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }

        return totalSize / (1024 * 1024); // Convert bytes to MB
    } catch (err) {
        console.error('👑 Royal Storage Error:', err);
        return 0;
    }
};

// Function to clean temp folder if size exceeds 100MB
const cleanTempFolderIfLarge = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
        
        if (sizeMB > 100) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const file of files) {
                const filePath = path.join(TEMP_MEDIA_DIR, file);
                fs.unlinkSync(filePath);
            }
            console.log('👑 Royal Storage: Cleared temporary media cache');
        }
    } catch (err) {
        console.error('👑 Royal Storage Cleanup Error:', err);
    }
};

// Start periodic cleanup check every 1 minute
setInterval(cleanTempFolderIfLarge, 60 * 1000);

// Load config
function loadAntideleteConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
        return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch {
        return { enabled: false };
    }
}

// Save config
function saveAntideleteConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (err) {
        console.error('👑 Royal Config Save Error:', err);
    }
}

// Store messages for antidelete
async function storeMessage(message) {
    try {
        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        
        let content = '';
        let mediaType = '';
        let mediaPath = '';

        // Extract content
        if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage?.caption) {
            content = message.message.imageMessage.caption;
            mediaType = 'image';
        } else if (message.message?.videoMessage?.caption) {
            content = message.message.videoMessage.caption;
            mediaType = 'video';
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
        }

        // Download media if present
        if (mediaType) {
            const mediaMessage = message.message[`${mediaType}Message`];
            const stream = await downloadContentFromMessage(mediaMessage, mediaType);
            let buffer = Buffer.from([]);
            
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const fileName = `${messageId}.${mediaType === 'sticker' ? 'webp' : mediaType === 'video' ? 'mp4' : 'jpg'}`;
            mediaPath = path.join(TEMP_MEDIA_DIR, fileName);
            await writeFile(mediaPath, buffer);
        }

        messageStore.set(messageId, {
            content,
            sender,
            timestamp: new Date().toISOString(),
            isGroup,
            mediaType,
            mediaPath
        });

    } catch (err) {
        console.error('👑 Royal Message Storage Error:', err);
    }
}

// Handle antidelete command
async function handleAntideleteCommand(sock, chatId, message, match) {
    try {
        if (!message.key.fromMe) {
            return sock.sendMessage(chatId, { 
                text: '👑 *Royal Decree:* Only Her Majesty can adjust these settings!',
                mentions: [message.key.participant]
            });
        }

        const config = loadAntideleteConfig();

        if (!match) {
            return sock.sendMessage(chatId, {
                text: `*👑 SILATRIX BOT — ANTIDELETE SETTINGS 👑*\n\nCurrent Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n*.antidelete on* - Enable protection\n*.antidelete off* - Disable protection`
            });
        }

        if (match === 'on') {
            config.enabled = true;
            saveAntideleteConfig(config);
            return sock.sendMessage(chatId, {
                text: '👑 *Royal Announcement:* Antidelete protection has been activated across the kingdom!'
            });
        }

        if (match === 'off') {
            config.enabled = false;
            saveAntideleteConfig(config);
            return sock.sendMessage(chatId, {
                text: '👑 *Royal Announcement:* Antidelete protection has been deactivated.'
            });
        }

        return sock.sendMessage(chatId, {
            text: '👑 *Royal Notice:* Invalid command. Use *.antidelete* to see options.'
        });

    } catch (err) {
        console.error('👑 Royal Command Error:', err);
        await sock.sendMessage(chatId, {
            text: '👑 *Royal Notice:* An error occurred while processing your command.'
        });
    }
}

// Handle deleted messages
async function handleMessageRevocation(sock, message) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled) return;

        const revokedMessage = message.message.protocolMessage;
        const messageId = revokedMessage.key.id;
        const deletedBy = message.key.participant || message.key.remoteJid;
        const original = messageStore.get(messageId);

        if (!original) return;

        const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const time = new Date(original.timestamp).toLocaleString();
        const sender = original.sender;
        const senderName = sender.split('@')[0];
        let groupName = '';

        if (original.isGroup) {
            const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
            groupName = groupMetadata.subject;
        }

        let text = `*👑 SILATRIX MD- ANTIDELETE REPORT 👑*\n\n` +
            `*🗑️ Deleted By:* @${deletedBy.split('@')[0]}\n` +
            `*👤 Sender:* @${senderName}\n` +
            `*📱 Number:* ${sender}\n` +
            `*🕒 Time:* ${time}\n`;

        if (groupName) text += `*👥 Group:* ${groupName}\n`;

        if (original.content) {
            text += `\n*💬 Deleted Message:*\n${original.content}`;
        }

        await sock.sendMessage(ownerNumber, {
            text,
            mentions: [deletedBy, sender]
        });

        // Media sending
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = {
                caption: `*👑 Deleted ${original.mediaType} restored by Queen Emily MD*\nFrom: @${senderName}`,
                mentions: [sender]
            };

            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(ownerNumber, {
                            image: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'sticker':
                        await sock.sendMessage(ownerNumber, {
                            sticker: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'video':
                        await sock.sendMessage(ownerNumber, {
                            video: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                }
            } catch (err) {
                await sock.sendMessage(ownerNumber, {
                    text: `⚠️ Queen Emily MD encountered an error sending media: ${err.message}`
                });
            }

            // Cleanup
            try {
                fs.unlinkSync(original.mediaPath);
            } catch (err) {
                console.error('👑 Royal Media Cleanup Error:', err);
            }
        }

        messageStore.delete(messageId);

    } catch (err) {
        console.error('👑 Royal Antidelete Error:', err);
    }
}

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};