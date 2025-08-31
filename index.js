require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const { 
    default: makeWASocket,
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// Global WhatsApp Channel Link
global.whatsappChannelLink = "https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L";

const store = {
    messages: {},
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => {
        return {}
    },
    bind: function(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key && msg.key.remoteJid) {
                    this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {}
                    this.messages[msg.key.remoteJid][msg.key.id] = msg
                }
            })
        })
        
        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) {
                    this.contacts[contact.id] = contact
                }
            })
        })
        
        ev.on('chats.set', (chats) => {
            this.chats = chats
        })
    },
    loadMessage: async (jid, id) => {
        return this.messages[jid]?.[id] || null
    }
}

let phoneNumber = "255789661031" // Default phone number, can be overridden by user input
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "SILATRIX MD 👑"
global.themeemoji = "👑"
global.channelLink = global.whatsappChannelLink // Using the global variable

const settings = require('./settings')
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}

async function createFancyWelcomeMessage(userId) {
    const royalBanner = `
╔══════════════════════════════════╗
║                                  ║
║   🏰 *KARIBU KATIKA SILATRIX MD* 🏰  ║
║                                  ║
╚══════════════════════════════════╝

👑 *Habarini, mpendwa mtumiaji!* 👑

Umepokea mwaliko wa kutumia *SILATRIX MD*!

Hapa kwenye jukwaa letu, utapata:
✨ Huduma bora za WhatsApp
✨ Vifaa vya usimamizi wa makundi
✨ Ujuzi wa hali ya juu

📜 *Maagizo Muhimu:*
1. Kuwa na heshima kila wakati
2. Tumia amri kwa busara
3 Jiunge na vyombo vyetu kwa habari za sasa

⏳ *Muda wa Sasa:* ${new Date().toLocaleString()}

╔══════════════════════════════════╗
║       *VYOMBO VYETU*          ║
╚══════════════════════════════════╝
📢 *Kituo cha WhatsApp:* ${global.whatsappChannelLink}
📢 *Kikundi cha WhatsApp:* https://chat.whatsapp.com/FJaYH3HS1rv5pQeGOmKtbM
📡 *Kituo cha Telegram:* https://t.me/chawatech
🎥 *Kituo cha YouTube:* https://www.youtube.com/@Silatrix22
`;

    const buttons = [
        {
            urlButton: {
                displayText: "👑 Jiunge na Kituo",
                url: global.whatsappChannelLink
            }
        },
        {
            urlButton: {
                displayText: "💬 Kikundi cha WhatsApp",
                url: "https://chat.whatsapp.com/FJaYH3HS1rv5pQeGOmKtbM"
            }
        },
        {
            urlButton: {
                displayText: "📡 Telegram",
                url: "https://t.me/+RyHOondjwZdkZDY0"
            }
        },
        {
            urlButton: {
                displayText: "🎥 YouTube",
                url: "https://www.youtube.com/@Silatrix22"
            }
        },
        {
            quickReplyButton: {
                displayText: "🛡️ Amri Zote",
                id: "!help"
            }
        },
        {
            quickReplyButton: {
                displayText: "⚔️ Usaidizi",
                id: "!support"
            }
        }
    ];

    return {
        text: royalBanner,
        footer: "SILA-TECH daima! Safari yako iwe na mafanikio!",
        templateButtons: buttons,
        mentions: [userId],
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '0029Vb77pP4A89Mje20udJ32@newsletter',
                newsletterName: 'SILATRIX MD 👑',
                serverMessageId: -1
            }
        }
    };
}

async function startXeonBotInc() {
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const XeonBotInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), 
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    })

    store.bind(XeonBotInc.ev)

    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(XeonBotInc, chatUpdate);
                return;
            }
            if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            
            try {
                await handleMessages(XeonBotInc, chatUpdate, true)
            } catch (err) {
                console.error("Hitilafu ya Amri:", err)
                if (mek.key && mek.key.remoteJid) {
                    await XeonBotInc.sendMessage(mek.key.remoteJid, { 
                        text: `⚠️ Amri Imeshindwa!\n\nJiunge na kituo chetu kwa sasisho: ${global.whatsappChannelLink}`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '',
                                newsletterName: 'SILATRIX MD 👑',
                                serverMessageId: -1
                            }
                        }
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Hitilafu ya Jukwaa:", err)
        }
    })

    XeonBotInc.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    XeonBotInc.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = XeonBotInc.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    XeonBotInc.getName = (jid, withoutContact = false) => {
        id = XeonBotInc.decodeJid(jid)
        withoutContact = XeonBotInc.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ?
            XeonBotInc.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    XeonBotInc.public = true
    XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store)

    if (pairingCode && !XeonBotInc.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        let phoneNumber
        if (!!global.phoneNumber) {
            phoneNumber = global.phoneNumber
        } else {
            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(` weka namba yako ya WhatsApp \nMfumo: 255612491551 (bila + au nafasi) : `)))
        }

        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        const pn = require('awesome-phonenumber');
        if (!pn('+' + phoneNumber).isValid()) {
            console.log(chalk.red('Namba siyo sahihi. weka namba yako kamili (mfano: 255612491551) bila + au nafasi.'));
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                let code = await XeonBotInc.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.black(chalk.bgGreen(`Msimbo wako wa Kuunganisha : `)), chalk.black(chalk.white(code)))
                console.log(chalk.yellow(`\nTafadhali weka msimbo huu kwenye WhatsApp yako:\n1. Fungua WhatsApp\n2. Nenda kwenye Mipangilio > Vifaa Vilivyounganishwa\n3. Bofya "Unganisha Kifaa"\n4. Weka msimbo ulioonyeshwa hapo juu`))
            } catch (error) {
                console.error('Hitilafu ya Kuunganisha:', error)
                console.log(chalk.red('Imeshindwa kupata msimbo wa kuunganisha. Tafadhali angalia namba yako na ujaribu tena.'))
            }
        }, 3000)
    }

    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            console.log(chalk.magenta(` `))
            console.log(chalk.yellow(`👑 SILATRIX MD Imeunganishwa kwa => ` + JSON.stringify(XeonBotInc.user, null, 2)))
            
            // Send welcome message to bot owner
            const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
            try {
                const welcomeMsg = await createFancyWelcomeMessage(botNumber);
                await XeonBotInc.sendMessage(botNumber, welcomeMsg);
                
                // Additional announcement
                await XeonBotInc.sendMessage(botNumber, {
                    text: `📢 *Tangazo Muhimu*\n\n` +
                          `SILATRIX MD sasa ipo tayari kutumika!\n\n` +
                          `Tumia *.help* kuona amri zote\n` +
                          `Jiunge na vyombo vyetu:\n` +
                          `Kituo cha WhatsApp: ${global.whatsappChannelLink}\n` +
                          `Kikundi cha WhatsApp: https://chat.whatsapp.com/FJaYH3HS1rv5pQeGOmKtbM\n` +
                          `Telegram: https://t.me/+RyHOondjwZdkZDY0\n` +
                          `YouTube: https://youtube.com/@rich_bess`,
                    templateButtons: [{
                        index: 1, 
                        urlButton: {
                            displayText: '👑 Jiunge na Kituo',
                            url: global.whatsappChannelLink
                        }
                    }],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });
            } catch (error) {
                console.error('Hitilafu ya Tangazo:', error);
            }

            await delay(1999)
            console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || 'SILATRIX MD 👑'} ]`)}\n\n`))
            console.log(chalk.cyan(`< ================ SILATRIX MD ================ >`))
            console.log(chalk.magenta(`\n${global.themeemoji || '👑'} Mwanzilishi: SILA TECH`))
            console.log(chalk.magenta(`${global.themeemoji || '👑'} Msaidizi: Prince favour`))
            console.log(chalk.magenta(`${global.themeemoji || '👑'} Namba ya Mwenyeji: ${owner}`))
            console.log(chalk.green(`${global.themeemoji || '👑'} SILATRIX MD imefanikiwa kuanzishwa! 👑`))
            console.log(chalk.blue(`📢 Kituo cha WhatsApp: ${global.whatsappChannelLink}`))
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            startXeonBotInc()
        }
    })

    XeonBotInc.ev.on('creds.update', saveCreds)
    
    XeonBotInc.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(XeonBotInc, update);
    });

    // Send welcome message to new users
    XeonBotInc.ev.on('contacts.upsert', async (contacts) => {
        for (const contact of contacts) {
            if (contact.status === 'add') {
                try {
                    const userId = XeonBotInc.decodeJid(contact.id);
                    const welcomeMsg = await createFancyWelcomeMessage(userId);
                    await XeonBotInc.sendMessage(userId, welcomeMsg);
                } catch (error) {
                    console.error('Hitilafu ya Karibuni:', error);
                }
            }
        }
    });

    return XeonBotInc
}

startXeonBotInc().catch(error => {
    console.error('Hitilafu Kubwa:', error)
    process.exit(1)
})
process.on('uncaughtException', (err) => {
    console.error('Hitilafu Isiyotarajiwa:', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Hitilafu ya Kuzuia:', err)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`👑 Sasisho la SILATRIX MD: ${__filename}`))
    delete require.cache[file]
    require(file)
})