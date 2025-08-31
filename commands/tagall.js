const isAdmin = require('../lib/isAdmin');

async function tagAllCommand(sock, chatId, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isSenderAdmin && !isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'Only admins can use the .tagall command.' });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: 'No participants found in the group.' });
            return;
        }

        let message = '> SILATRIX MD summons all members (SILATRIX MD is awesome)\n\n';
        participants.forEach(participant => {
            message += `@${participant.id.split('@')[0]}\n`;
        });

        // Send message with mentions + channel button
        await sock.sendMessage(chatId, {
            text: message,
            mentions: participants.map(p => p.id),
            footer: "Join my channel for updates!",
            templateButtons: [
                {
                    index: 1,
                    urlButton: {
                        displayText: "👉 View Channel 👈",
                        url: "https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L" // Your channel link
                    }
                }
            ]
        });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to tag all members.' });
    }
}

module.exports = tagAllCommand;