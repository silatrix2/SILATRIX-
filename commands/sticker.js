const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

// Royal Configuration
const ROYAL_JID = '0029Vb77pP4A89Mje20udJ32@newsletter';
const CHANNEL_LINK = `https://whatsapp.com/channel/${ROYAL_JID.split('@')[0]}`;

async function stickerCommand(sock, chatId, message) {
    // Royal message to quote in reply
    const royalMessageToQuote = message;
    
    // Determine target message for media
    let targetMessage = message;

    // Handle royal replies
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedInfo = message.message.extendedTextMessage.contextInfo;
        targetMessage = {
            key: {
                remoteJid: chatId,
                id: quotedInfo.stanzaId,
                participant: quotedInfo.participant
            },
            message: quotedInfo.quotedMessage
        };
    }

    const mediaMessage = targetMessage.message?.imageMessage || 
                        targetMessage.message?.videoMessage || 
                        targetMessage.message?.documentMessage;

    if (!mediaMessage) {
        await sock.sendMessage(chatId, { 
            text: '👑 *Royal Decree:*\n\nYou must present an image or video to create a royal sticker!\n\n*Reply to media or include with .sticker command*',
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: ROYAL_JID,
                    newsletterName: 'Queen Emily MD'
                }
            },
            templateButtons: [
                {
                    urlButton: {
                        displayText: '📡 Sticker Guide',
                        url: CHANNEL_LINK
                    }
                }
            ]
        }, { quoted: royalMessageToQuote });
        return;
    }

    try {
        // Announce royal sticker creation
        await sock.sendMessage(chatId, {
            text: '🎨 *Royal Announcement:*\n\nHer Majesty\'s artists are crafting your sticker...',
            templateButtons: [
                {
                    quickReplyButton: {
                        displayText: '🕒 Be Patient',
                        id: '!waiting'
                    }
                }
            ]
        });

        const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { 
            logger: undefined, 
            reuploadRequest: sock.updateMediaMessage 
        });

        if (!mediaBuffer) {
            await sock.sendMessage(chatId, { 
                text: '💢 *Royal Mishap:*\n\nThe royal portrait could not be acquired!\n\n*Try again when the court artists are available*',
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: ROYAL_JID,
                        newsletterName: 'SILATRIX MD'
                    }
                },
                templateButtons: [
                    {
                        urlButton: {
                            displayText: '📡 Report Issue',
                            url: CHANNEL_LINK
                        }
                    }
                ]
            });
            return;
        }

        // Prepare royal art studio
        const royalStudio = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(royalStudio)) {
            fs.mkdirSync(royalStudio, { recursive: true });
        }

        // Create royal file paths
        const royalInput = path.join(royalStudio, `royal_art_${Date.now()}`);
        const royalOutput = path.join(royalStudio, `royal_sticker_${Date.now()}.webp`);

        // Preserve the royal media
        fs.writeFileSync(royalInput, mediaBuffer);

        // Determine if media is animated
        const isAnimated = mediaMessage.mimetype?.includes('gif') || 
                          mediaMessage.mimetype?.includes('video') || 
                          mediaMessage.seconds > 0;

        // Royal conversion command (optimized for perfect 512x512 sticker size)
        const royalConversion = isAnimated
            ? `ffmpeg -i "${royalInput}" -vf "scale=512:512:force_original_aspect_ratio=increase:flags=lanczos,crop=512:512,fps=15" -c:v libwebp -quality 90 -compression_level 6 -loop 0 -preset default -an -vsync 0 "${royalOutput}"`
            : `ffmpeg -i "${royalInput}" -vf "scale=512:512:force_original_aspect_ratio=increase:flags=lanczos,crop=512:512" -c:v libwebp -quality 90 -compression_level 6 -preset default -an -vsync 0 "${royalOutput}"`;

        await new Promise((resolve, reject) => {
            exec(royalConversion, (error) => {
                if (error) {
                    console.error('Royal Artist Error:', error);
                    reject(error);
                } else resolve();
            });
        });

        // Prepare royal metadata
        const webpBuffer = fs.readFileSync(royalOutput);
        const img = new webp.Image();
        await img.load(webpBuffer);

        // Create royal seal (metadata)
        const royalSeal = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': settings.packname || 'SILATRIX MD',
            'sticker-pack-publisher': 'royally made',
            'emojis': ['👑', '⚜️', '🎨']
        };

        // Craft royal exif
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(royalSeal), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);

        // Apply royal seal
        img.exif = exif;
        const finalBuffer = await img.save(null);

        // Present the royal sticker (without channel button as requested)
        await sock.sendMessage(chatId, { 
            sticker: finalBuffer,
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: ROYAL_JID,
                    newsletterName: 'Silatrix MD'
                }
            }
        }, { quoted: royalMessageToQuote });

        // Clean the royal studio
        try {
            fs.unlinkSync(royalInput);
            fs.unlinkSync(royalOutput);
        } catch (err) {
            console.error('Royal Cleanup Error:', err);
        }

        // Send follow-up with channel button
        await sock.sendMessage(chatId, {
            text: '✨ *Royal Decree:*\n\nYour sticker has been crafted with royal perfection!',
            templateButtons: [
                {
                    urlButton: {
                        displayText: '📡 More Sticker Packs',
                        url: CHANNEL_LINK
                    }
                }
            ]
        });

    } catch (error) {
        console.error('Royal Sticker Error:', error);
        await sock.sendMessage(chatId, { 
            text: '💢 *Royal Disaster:*\n\nThe royal sticker creation has failed!\n\n*Her Majesty demands you try again later*',
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: ROYAL_JID,
                    newsletterName: 'Silatrix MD'
                }
            },
            templateButtons: [
                {
                    urlButton: {
                        displayText: '📡 Get Help',
                        url: CHANNEL_LINK
                    }
                }
            ]
        });
    }
}

module.exports = stickerCommand;