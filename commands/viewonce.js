const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function viewonceCommand(sock, chatId, message) {
    // Extract quoted imageMessage or videoMessage from your structure
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;

    if (quotedImage && quotedImage.viewOnce) {
        // Download and send the image
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        
        const originalCaption = quotedImage.caption || '';
        const newCaption = originalCaption + (originalCaption ? '\n\n' : '') + '_SILATRIX MD_';
        
        await sock.sendMessage(chatId, { 
            image: buffer, 
            fileName: 'media.jpg', 
            caption: newCaption 
        }, { quoted: message });
    } else if (quotedVideo && quotedVideo.viewOnce) {
        // Download and send the video
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        
        const originalCaption = quotedVideo.caption || '';
        const newCaption = originalCaption + (originalCaption ? '\n\n' : '') + '> SILATRIX MD';
        
        await sock.sendMessage(chatId, { 
            video: buffer, 
            fileName: 'media.mp4', 
            caption: newCaption 
        }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: '❌  reply to a view-once image or video.' }, { quoted: message });
    }
}

module.exports = viewonceCommand;