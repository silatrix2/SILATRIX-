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
✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦
           ✦ SILATRIX 𝐌𝐃 ✦
⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅
✦ 𝖁𝖊𝖗𝖘𝖎𝖔𝖓: ${settings.version || '1.0'} 
✦ 𝕯𝖊𝖛𝖊𝖑𝖔𝖕𝖊𝖗: ${settings.botOwner || 'C.O Tech'}
✦ 𝕮𝖔𝖒𝖒𝖆𝖓𝖉𝖘: ${totalCommands}
✦ 𝖀𝖕𝖙𝖎𝖒𝖊: ${uptime}
✦ 𝕾𝖕𝖊𝖊𝖉: ${avgSpeed}
✦ 𝕿𝖎𝖒𝖊: ${currentTime} (${currentDate})
✦ 𝕯𝖆𝖞: ${day}
✦ 𝕻𝖑𝖆𝖙𝖋𝖔𝖗𝖒: ${platform}
✦ 𝕸𝖊𝖒𝖔𝖗𝖞: ${memoryInfo}
✦ 𝖀𝖘𝖊𝖗: ${userInfo}
✦ 𝕻𝖗𝖊𝖋𝖎𝖝: ${settings.prefix || '.'}
⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅

╔════════════════════════════════╗
  🧠 𝕀𝕟𝕥𝕖𝕝𝕝𝕚𝕘𝕖𝕟𝕔𝕖 (4)
╚════════════════════════════════╝
🔮 .gpt 5 - Royal advisor
🔮 .gemini - Advanced counsel
🔮 .imagine - Royal visions
🔮 .flux - Advanced visions
 

╔════════════════════════════════╗
  🏰 ℂ𝕠𝕦𝕣𝕥 𝔼𝕤𝕤𝕖𝕟𝕥𝕚𝕒𝕝𝕤 (18)
╚════════════════════════════════╝
✨ .help/.menu - Royal command list
✨ .ping - Check royal responsiveness
✨ .alive - Verify royal presence
✨ .tts <text> - Royal speech
✨ .owner - Summon the royal developer
✨ .joke - Royal humor
✨ .quote - Royal wisdom
✨ .fact - Royal knowledge
✨ .weather <city> - Royal forecast
✨ .news - Royal updates
✨ .attp <text> - Animated royal text
✨ .lyrics <song> - Royal ballads
✨ .groupinfo - Court details
✨ .admins - Royal advisors
✨ .vv - Royal voice effects
✨ .trt <text> - Royal translation
✨ .ss <link> - Royal screenshot
✨ .jid - Royal identification
✨ .autosend - for stealing peeps whatsapp post

╔════════════════════════════════╗
  👑 ℂ𝕣𝕠𝕨𝕟 𝕁𝕖𝕨𝕖𝕝𝕤 (7)
╚════════════════════════════════╝
💎 .mode - Change royal modes
💎 .autostatus - Royal updates
💎 .clearsession - Reset royal access
💎 .antidelete - Preserve messages
💎 .cleartmp - Clean royal chambers
💎 .setpp - Change royal portrait
💎 .autoreact - Royal reactions

╔════════════════════════════════╗
  ⚜️ ℝ𝕠𝕪𝕒𝕝 𝔸𝕕𝕞𝕚𝕟 (18)
╚════════════════════════════════╝
🗡️ .ban @user - Banish from court
🗡️ .promote @user - Grant nobility
🗡️ .demote @user - Revoke nobility
🗡️ .mute <mins> - Silence offender
🗡️ .unmute - Restore voice
🗡️ .delete - Purge messages
🗡️ .kick @user - Remove from court
🗡️ .warnings - View offenses
🗡️ .warn @user - Issue royal warning
🗡️ .antilink - Protect kingdom
🗡️ .antibadword - Filter vulgarity
🗡️ .clear - Cleanse chat
🗡️ .tag - Royal summons
🗡️ .tagall - Summon all
🗡️ .chatbot - Royal advisor
🗡️ .resetlink - New royal invitation
🗡️ .welcome - Royal greetings
🗡️ .goodbye - Royal farewells

╔════════════════════════════════╗
  🎨 𝔸𝕣𝕥𝕚𝕤𝕥𝕣𝕪 (7)
╚════════════════════════════════╝
🎭 .blur - Soften images
🎭 .simage - Sticker to image
🎭 .sticker - Create royal seals
🎭 .tgsticker - Telegram seals
🎭 .meme - Royal humor
🎭 .take - Claim stickers
🎭 .emojimix - Combine royal symbols

╔════════════════════════════════╗
  🎮 𝔾𝕒𝕞𝕖𝕤 (7)
╚════════════════════════════════╝
♟️ .tictactoe - Royal strategy
♟️ .hangman - Word puzzle
♟️ .guess - Solve royal riddle
♟️ .trivia - Test knowledge
♟️ .answer - Respond to quiz
♟️ .truth - Royal interrogation
♟️ .dare - Royal challenge

╔════════════════════════════════╗
  🎪 𝔼𝕟𝕥𝕖𝕣𝕥𝕒𝕚𝕟𝕞𝕖𝕟𝕥 (11)
╚════════════════════════════════╝
🎭 .compliment - Royal praise
🎭 .insult - Playful jests
🎭 .flirt - Courtly romance
🎭 .shayari - Royal poetry
🎭 .goodnight - Royal rest
🎭 .roseday - Celebration
🎭 .character - Royal analysis
🎭 .wasted - GTA style
🎭 .ship - Matchmaking
🎭 .simp - Admiration
🎭 .stupid - Humorous images

╔════════════════════════════════╗
  ✨ 𝕋𝕖𝕩𝕥 𝔸𝕣𝕥 (18)
╚════════════════════════════════╝
🖋️ .metallic - Shiny text
🖋️ .ice - Frozen text
🖋️ .snow - Winter text
🖋️ .impressive - Fancy text
🖋️ .matrix - Digital text
🖋️ .light - Glowing text
🖋️ .neon - Bright text
🖋️ .devil - Evil text
🖋️ .purple - Regal text
🖋️ .thunder - Stormy text
🖋️ .leaves - Nature text
🖋️ .1917 - Vintage text
🖋️ .arena - Battle text
🖋️ .hacker - Code text
🖋️ .sand - Beach text
🖋️ .blackpink - K-pop text
🖋️ .glitch - Digital text
🖋️ .fire - Flaming text

╔════════════════════════════════╗
  📜 𝔸𝕣𝕔𝕙𝕚𝕧𝕖𝕤 (7)
╚════════════════════════════════╝
🎵 .play - Stream music
🎵 .song - Download audio
🎵 .instagram - Save posts
🎵 .facebook - Save content
🎵 .tiktok - Download videos
🎵 .video - Search videos
🎵 .ytmp4 - YouTube download

╔════════════════════════════════╗
  💻 ℂ𝕠𝕕𝕖 (5)
╚════════════════════════════════╝
👨‍💻 .git - Repository
👨‍💻 .github - Project
👨‍💻 .repo - Links

✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦
       *✦ Long may silatrix reign! ✦*
✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦

if you want to deploy the bot  .repo or .github
 `;

  try {
        const imagePath = path.join(__dirname, '../assets/v1.jpg');
        const buttons = [
            {
                urlButton: {
                    displayText: "👑 Join Channel",
                    url: global.whatsappChannelLink
                }
            },
            {
                urlButton: {
                    displayText: "💬 WhatsApp Group",
                    url: global.whatsappGroupLink
                }
            },
           
            {
                quickReplyButton: {
                    displayText: "⚔️ Support",
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