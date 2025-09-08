const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');
const moment = require('moment-timezone');

async function helpCommand(sock, chatId, message) {
    global.whatsappChannelLink = "https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L";
    // Calculate system stats
    const uptime = moment.duration(process.uptime(), 'seconds').humanize();
    const memoryUsage = process.memoryUsage().rss;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const platform = `${os.platform()} ${os.release()}`;
    const currentTime = moment().tz('Asia/Kolkata').format('h:mm A');
    const currentDate = moment().tz('Asia/Kolkata').format('DD/MM/YYYY');
    const day = moment().tz('Asia/Kolkata').format('dddd');
    const userInfo = message.pushName || 'Royal Subject';
    const totalCommands = 104;
    const avgSpeed = '0.35s';

    // Format memory information with percentage
    const formatMemory = (bytes) => `${Math.round(bytes / 1024 / 1024)}MB`;
    const usedPercentage = Math.round((memoryUsage / totalMemory) * 100);
    const freePercentage = Math.round((freeMemory / totalMemory) * 100);
    const memoryInfo = ` ${formatMemory(memoryUsage)}/${formatMemory(totalMemory)} (${freePercentage}% free, ${usedPercentage}% used)`;

    const helpMessage = `
╔══════════════════════════════════════════════════╗
║  ███████╗██╗██╗     ███████╗████████╗██████╗ ██╗║
║  ██╔════╝██║██║     ██╔════╝╚══██╔══╝██╔══██╗██║║
║  ███████╗██║██║     █████╗     ██║   ██████╔╝██║║
║  ╚════██║██║██║     ██╔══╝     ██║   ██╔══██╗██║║
║  ███████║██║███████╗███████╗   ██║   ██║  ██║██║║
║  ╚══════╝╚═╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝║
╠══════════════════════════════════════════════════╣
║             👑 SILATRIX MD ROYAL COURT 👑        ║
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  ROYAL STATISTICS                ║
╠══════════════════════════════════════════════════╣
║  👑 Version: ${settings.version || '1.0'} 
║  🛠️ Developer: ${settings.botOwner || 'C.O Tech'}
║  ⚡ Commands: ${totalCommands}
║  ⏳ Uptime: ${uptime}
║  🚀 Speed: ${avgSpeed}
║  🕒 Time: ${currentTime} (${currentDate})
║  📅 Day: ${day}
║  💻 Platform: ${platform}
║  💾 Memory: ${memoryInfo}
║  👤 User: ${userInfo}
║  🎯 Prefix: ${settings.prefix || '.'}
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  🧠 ROYAL INTELLIGENCE           ║
╠══════════════════════════════════════════════════╣
║  🔮 .gpt [query] - Consult the royal advisor
║  🔮 .gemini [query] - Advanced counsel
║  🔮 .imagine [prompt] - Create royal visions
║  🔮 .flux [prompt] - Advanced AI visions
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  🏰 COURT ESSENTIALS             ║
╠══════════════════════════════════════════════════╣
║  ✨ .help/.menu - Display royal command list
║  ✨ .ping - Check royal responsiveness
║  ✨ .alive - Verify royal presence
║  ✨ .tts [text] - Convert text to royal speech
║  ✨ .owner - Summon the royal developer
║  ✨ .joke - Royal humor
║  ✨ .quote - Royal wisdom
║  ✨ .fact - Royal knowledge
║  ✨ .weather [city] - Royal forecast
║  ✨ .news - Royal updates
║  ✨ .attp [text] - Animated royal text
║  ✨ .lyrics [song] - Royal ballads
║  ✨ .groupinfo - Court details
║  ✨ .admins - Royal advisors list
║  ✨ .vv - Royal voice effects
║  ✨ .trt [text] - Royal translation
║  ✨ .ss [link] - Royal screenshot
║  ✨ .jid - Royal identification
║  ✨ .autosend - Steal WhatsApp posts
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  👑 CROWN JEWELS                 ║
╠══════════════════════════════════════════════════╣
║  💎 .mode - Change royal modes
║  💎 .autostatus - Automatic royal updates
║  💎 .clearsession - Reset royal access
║  💎 .antidelete - Preserve royal messages
║  💎 .cleartmp - Clean royal chambers
║  💎 .setpp - Change royal portrait
║  💎 .autoreact - Automatic royal reactions
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  ⚜️ ROYAL ADMINISTRATION         ║
╠══════════════════════════════════════════════════╣
║  🗡️ .ban @user - Banish from court
║  🗡️ .promote @user - Grant nobility
║  🗡️ .demote @user - Revoke nobility
║  🗡️ .mute [mins] - Silence offender
║  🗡️ .unmute - Restore voice
║  🗡️ .delete - Purge messages
║  🗡️ .kick @user - Remove from court
║  🗡️ .warnings - View offenses
║  🗡️ .warn @user - Issue royal warning
║  🗡️ .antilink - Protect kingdom
║  🗡️ .antibadword - Filter vulgarity
║  🗡️ .clear - Cleanse chat
║  🗡️ .tag - Royal summons
║  🗡️ .tagall - Summon all subjects
║  🗡️ .chatbot - Royal advisor activation
║  🗡️ .resetlink - New royal invitation
║  🗡️ .welcome - Royal greetings setup
║  🗡️ .goodbye - Royal farewells setup
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  🎨 ROYAL ARTISTRY               ║
╠══════════════════════════════════════════════════╣
║  🎭 .blur - Soften royal images
║  🎭 .simage - Convert sticker to image
║  🎭 .sticker - Create royal seals
║  🎭 .tgsticker - Create Telegram seals
║  🎭 .meme - Royal humor creation
║  🎭 .take - Claim stickers
║  🎭 .emojimix - Combine royal symbols
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  🎮 ROYAL GAMES                  ║
╠══════════════════════════════════════════════════╣
║  ♟️ .tictactoe - Royal strategy game
║  ♟️ .hangman - Word puzzle challenge
║  ♟️ .guess - Solve royal riddle
║  ♟️ .trivia - Test knowledge
║  ♟️ .answer - Respond to royal quiz
║  ♟️ .truth - Royal interrogation
║  ♟️ .dare - Royal challenge
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  🎪 ROYAL ENTERTAINMENT          ║
╠══════════════════════════════════════════════════╣
║  🎭 .compliment - Royal praise
║  🎭 .insult - Playful jests
║  🎭 .flirt - Courtly romance
║  🎭 .shayari - Royal poetry
║  🎭 .goodnight - Royal rest wishes
║  🎭 .roseday - Celebration messages
║  🎭 .character - Royal personality analysis
║  🎭 .wasted - GTA-style images
║  🎭 .ship - Royal matchmaking
║  🎭 .simp - Admiration expressions
║  🎭 .stupid - Humorous image creation
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  ✨ ROYAL TEXT ART               ║
╠══════════════════════════════════════════════════╣
║  🖋️ .metallic - Shiny royal text
║  🖋️ .ice - Frozen text style
║  🖋️ .snow - Winter-themed text
║  🖋️ .impressive - Fancy text design
║  🖋️ .matrix - Digital text effect
║  🖋️ .light - Glowing text creation
║  🖋️ .neon - Bright text style
║  🖋️ .devil - Evil-themed text
║  🖋️ .purple - Regal text color
║  🖋️ .thunder - Stormy text effect
║  🖋️ .leaves - Nature-inspired text
║  🖋️ .1917 - Vintage text style
║  🖋️ .arena - Battle-themed text
║  🖋️ .hacker - Code-style text
║  🖋️ .sand - Beach-themed text
║  🖋️ .blackpink - K-pop style text
║  🖋️ .glitch - Digital distortion text
║  🖋️ .fire - Flaming text effect
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  📜 ROYAL ARCHIVES               ║
╠══════════════════════════════════════════════════╣
║  🎵 .play [song] - Stream royal music
║  🎵 .song [title] - Download audio
║  🎵 .instagram [url] - Save Instagram posts
║  🎵 .facebook [url] - Save Facebook content
║  🎵 .tiktok [url] - Download TikTok videos
║  🎵 .video [query] - Search for videos
║  🎵 .ytmp4 [url] - Download YouTube videos
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║                  💻 ROYAL CODE                   ║
╠══════════════════════════════════════════════════╣
║  👨‍💻 .git - Repository information
║  👨‍💻 .github - Project details
║  👨‍💻 .repo - Royal bot links
╚══════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════╗
║      *✦ LONG MAY SILATRIX REIGN! ✦*             ║
╚══════════════════════════════════════════════════╝

Use ${settings.prefix || '.'}repo or ${settings.prefix || '.'}github to deploy the royal bot
`;

    try {
        const imagePath = path.join(__dirname, '../assets/v1.jpg');
        const buttons = [
            {
                urlButton: {
                    displayText: "👑 Join Royal Channel",
                    url: global.whatsappChannelLink
                }
            },
            {
                urlButton: {
                    displayText: "💬 Royal Court (Group)",
                    url: global.whatsappGroupLink || "https://chat.whatsapp.com/example"
                }
            },
            {
                quickReplyButton: {
                    displayText: "⚔️ Royal Support",
                    id: "!support"
                }
            }
        ];

        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029Vb77pP4A89Mje20udJ32@newsletter',
                        newsletterName: 'SILATRIX MD 👑',
                        serverMessageId: -1
                    }
                },
                templateButtons: buttons
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029Vb77pP4A89Mje20udJ32@newsletter',
                        newsletterName: 'SILATRIX MD 👑',
                        serverMessageId: -1
                    }
                },
                templateButtons: buttons
            });
        }
    } catch (error) {
        console.error('Royal Command Error:', error);
        await sock.sendMessage(chatId, { 
            text: helpMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });
    }
}

module.exports = helpCommand;
