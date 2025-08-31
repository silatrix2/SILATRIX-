const fs = require('fs');
const path = require('path');

async function autosend(sock, msg, chatId) {
    try {
        // Ensure this is a reply to a message
        if (!msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
            await sock.sendMessage(chatId, { text: '❌ Please reply to a WhatsApp post/status with "autosend" or "save".' });
            return;
        }

        // Get the quoted message key
        const quotedKey = {
            remoteJid: msg.key.remoteJid,
            id: msg.message.extendedTextMessage.contextInfo.stanzaId,
            participant: msg.message.extendedTextMessage.contextInfo.participant
        };

        // Download quoted message
        const quotedMsg = await sock.loadMessage(quotedKey.remoteJid, quotedKey.id);
        if (!quotedMsg || !quotedMsg.message) {
            await sock.sendMessage(chatId, { text: '❌ Could not find the original post.' });
            return;
        }

        // Detect media type
        let mediaType;
        if (quotedMsg.message.imageMessage) mediaType = 'image';
        else if (quotedMsg.message.videoMessage) mediaType = 'video';
        else if (quotedMsg.message.audioMessage) mediaType = 'audio';
        else if (quotedMsg.message.documentMessage) mediaType = 'document';
        else {
            await sock.sendMessage(chatId, { text: '❌ Unsupported post type.' });
            return;
        }

        // Ensure temp folder exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Download media
        const stream = await sock.downloadMediaMessage(quotedMsg);
        const fileName = path.join(tempDir, `post_${Date.now()}`);
        fs.writeFileSync(fileName, stream);

        // Send media back
        await sock.sendMessage(chatId, {
            [mediaType]: fs.readFileSync(fileName),
            caption: `📥 Saved from WhatsApp post`
        });

        // Delete temp file
        fs.unlinkSync(fileName);

    } catch (error) {
        console.error('Error in autosend:', error);
        await sock.sendMessage(chatId, { text: '⚠️ Failed to save the post. ' + error.message });
    }
}

module.exports = autosend;
