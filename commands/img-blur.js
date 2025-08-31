const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const sharp = require('sharp');

async function blurCommand(sock, chatId, message, quotedMessage) {
    try {
        // Get the image to blur
        let imageBuffer;

        if (quotedMessage) {
            // If replying to a message
            if (!quotedMessage.imageMessage) {
                await sock.sendMessage(chatId, { 
                    text: '⚠️ Please reply to an image to apply the blur effect.' 
                });
                return;
            }

            const quoted = {
                message: {
                    imageMessage: quotedMessage.imageMessage
                }
            };

            imageBuffer = await downloadMediaMessage(
                quoted,
                'buffer',
                {},
                {}
            );
        } else if (message.message?.imageMessage) {
            // If image is in current message
            imageBuffer = await downloadMediaMessage(
                message,
                'buffer',
                {},
                {}
            );
        } else {
            await sock.sendMessage(chatId, { 
                text: '📸 Send or reply to an image with the caption *.blur* to use this feature.' 
            });
            return;
        }

        // Resize and optimize image
        const resizedImage = await sharp(imageBuffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        // Apply blur effect directly using sharp
        const blurredImage = await sharp(resizedImage)
            .blur(10)
            .toBuffer();

        // Send the blurred image
        await sock.sendMessage(chatId, {
            image: blurredImage,
            caption: '✅ *Image blurred successfully by > SILATRIX MD!*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '0029Vb77pP4A89Mje20udJ32@newsletter',
                    newsletterName: 'SILATRIX MD',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Error in blur command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Unable to blur the image. Please try again later.' 
        });
    }
}

module.exports = blurCommand;
