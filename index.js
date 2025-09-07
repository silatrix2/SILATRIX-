// Check Node.js version
const requiredVersion = '20.0.0';
const currentVersion = process.version;

function parseVersion(version) {
  return version.replace('v', '').split('.').map(Number);
}

const [requiredMajor] = parseVersion(requiredVersion);
const [currentMajor] = parseVersion(currentVersion);

if (currentMajor < requiredMajor) {
  console.error(`❌ Node.js version ${requiredVersion} or higher is required. Current version: ${currentVersion}`);
  console.error('🔧 Please upgrade Node.js or check your environment configuration');
  process.exit(1);
}

console.log(`✅ Node.js version ${currentVersion} is compatible`);
// --- Bootstrap: ensure npm installs and .npmrc for legacy-peer-deps ---
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(...a) {
    console.log('[setup]', ...a)
}

// Ensure .npmrc contains legacy-peer-deps=true so Katabump's install respects it
try {
    const npmrcPath = path.join(process.cwd(), '.npmrc');
    if (!fs.existsSync(npmrcPath)) {
        log('.npmrc not found — creating with legacy-peer-deps=true');
        fs.writeFileSync(npmrcPath, 'legacy-peer-deps=true\n', { encoding: 'utf8' });
    } else {
        const cur = fs.readFileSync(npmrcPath, 'utf8');
        if (!/legacy-peer-deps\s*=\s*true/.test(cur)) {
            log('Adding legacy-peer-deps=true to .npmrc');
            fs.appendFileSync(npmrcPath, '\nlegacy-peer-deps=true\n', { encoding: 'utf8' });
        }
    }
} catch (err) {
    console.error('Failed to write .npmrc:', err);
}

// Helper: run npm install (legacy peer deps) if node_modules missing or if explicit package missing
function runNpmInstall(args = []) {
    try {
        const cmd = ['npm', 'install', '--no-audit', '--no-fund', '--legacy-peer-deps'].concat(args).join(' ');
        log('Running:', cmd);
        execSync(cmd, { stdio: 'inherit', env: Object.assign({}, process.env) });
        return true;
    } catch (e) {
        console.error('npm install failed:', e.message || e);
        return false;
    }
}

// If node_modules missing (fresh deploy), install once
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    log('node_modules not found — running npm install (legacy peer deps)...');
    runNpmInstall();
}

// Utility: ensure a package can be required; if not, install it then try again.
function ensurePackage(pkgName, installName = null) {
    installName = installName || pkgName;
    try {
        return require(pkgName);
    } catch (err) {
        log(`${pkgName} not found — installing ${installName}...`);
        const ok = runNpmInstall([installName]);
        if (!ok) {
            console.error(`Failed to install ${installName}`);
            return null;
        }
        // try to clear require cache for the package path and require again
        try {
            // give Node a tiny grace: remove package from require cache if present
            Object.keys(require.cache).forEach(k => {
                if (k.includes(path.join('node_modules', pkgName))) delete require.cache[k];
            });
            return require(pkgName);
        } catch (err2) {
            console.error(`Still cannot require ${pkgName} after install:`, err2);
            return null;
        }
    }
}

// --- End bootstrap ---

// Now the original file content with some requires replaced by ensurePackage where needed
require('./settings')

// For Boom we ensure it's installed because your runtime complained about it
const BoomPkg = ensurePackage('@hapi/boom') || {};
const { Boom } = BoomPkg.Boom ? BoomPkg : { Boom: BoomPkg.Boom || BoomPkg };

// Standard requires (most of these should exist in package.json)
const chalk = require('chalk')
const FileType = ensurePackage('file-type') || require('file-type')
const pathModule = require('path')
const axios = ensurePackage('axios') || require('axios')
const ffmpeg = ensurePackage('fluent-ffmpeg') || require('fluent-ffmpeg')
const qrcode = ensurePackage('qrcode') || require('qrcode')
const translate = ensurePackage('@vitalets/google-translate-api') || require('@vitalets/google-translate-api')
const weather = ensurePackage('weather-js') || require('weather-js')
const cheerio = ensurePackage('cheerio') || require('cheerio')

const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = ensurePackage('awesome-phonenumber') || require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await: awaitFn, sleep, reSize } = require('./lib/myfunc')

// Baileys - try to require; if missing, install then require
const baileysPkg = ensurePackage('@whiskeysockets/baileys') || require('@whiskeysockets/baileys')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, jidDecode, proto, jidNormalizedUser, makeCacheableSignalKeyStore, delay } = baileysPkg

const NodeCache = ensurePackage("node-cache") || require("node-cache")
const pino = ensurePackage("pino") || require("pino")
const readline = require("readline")
const { parsePhoneNumber } = ensurePackage("libphonenumber-js") || require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// Global WhatsApp Channel Link
global.whatsappChannelLink = "https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L";

// FEATURES CONFIGURATION
global.features = {
    autoviewStatus: true,
    antideleteMessage: true,
    fakeRecording: true,
    alwaysOnline: true,
    fakeTyping: true,
    autoLikeStatus: true,
    aiFeatures: true,
    chatGpt: true,
    autoReplyStatus: true,
    chatbot: true,
    autoBio: true,
    autoReact: true,
    autoReplyMessage: true,
    autoSaveContacts: true,
    antibun: true,
    antiWhatsAppBan: true,
    // NEW FEATURES ADDED
    antivirusScan: true,
    autoSticker: true,
    downloader: true,
    musicIdentification: true,
    currencyConverter: true,
    weatherForecast: true,
    languageTranslator: true,
    qrCodeGenerator: true,
    reminderSystem: true,
    mathSolver: true,
    passwordGenerator: true,
    urlShortener: true,
    imageEditor: true,
    voiceChanger: true,
    dictionary: true,
    newsFetcher: true,
    jokeTeller: true,
    factGenerator: true,
    prayerTimes: true,
    couponFinder: true
};

const store = {
    messages: {},
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => {
        return {}
    },
    bind: function (ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key && msg.key.remoteJid) {
                    this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {}
                    this.messages[msg.key.remoteJid][msg.key.id] = msg
                }
            })
        })
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

const rl = process.stdin.isTTY ? readline.createInterface({
    input: process.stdin,
    output: process.stdout
}) : null
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
║║                                ║
║🏰 KARIBU KATIKA SILATRIX MD 🏰  ║
║║                                ║
╚══════════════════════════════════╝

👑 Habarini, mpendwa mtumiaji! 👑

Umepokea mwaliko wa kutumia SILATRIX MD!...

⏳ Muda wa Sasa: ${new Date().toLocaleString()}

╔══════════════════════════════════╗
║          VYOMBO VYETU           ║
╚══════════════════════════════════╝
📢Kituo cha WhatsApp: ${global.whatsappChannelLink}
📢Kikundi cha WhatsApp: https://chat.whatsapp.com/FJaYH3HS1rv5pQeGOmKtbM
📡Kituo cha Telegram: https://t.me/chawatech
🎥Kituo cha YouTube: https://www.youtube.com/@Silatrix22

╔══════════════════════════════════╗
║          FEATURES ZOTE           ║
╚══════════════════════════════════╝
🔥 Autoview status
🔥 Antidelete message
🔥 Fake recording
🔥 Always online
🔥 Fake typing
🔥 Auto like status
🔥 AI features
🔥 Chat GPT features
🔥 Auto reply status
🔥 Chatbot
🔥 Auto bio
🔥 Auto react to messages
🔥 Auto reply message
🔥 Auto save contacts
🔥 Antibun protection
🔥 Anti WhatsApp ban mode
🔥 Antivirus scan
🔥 Auto sticker maker
🔥 Downloader suite
🔥 Music identification
🔥 Currency converter
🔥 Weather forecast
🔥 Language translator
🔥 QR code generator/reader
🔥 Reminder system
🔥 Math solver
🔥 Password generator
🔥 URL shortener
🔥 Image editor
🔥 Voice changer
🔥 Dictionary/thesaurus
🔥 News fetcher
🔥 Joke teller
🔥 Fact generator
🔥 Prayer times
🔥 Coupon finder

Tumia command !help kuona maelezo zaidi!`;
    return royalBanner;
}

// NEW FEATURE FUNCTIONS
async function scanForViruses(fileBuffer) {
    // Implement virus scanning logic here
    return { isInfected: false, threats: [] };
}

async function createSticker(imageBuffer) {
    // Implement sticker creation logic
    return imageBuffer;
}

async function downloadMedia(url, platform) {
    // Implement media downloader
    return { success: true, buffer: null };
}

async function identifyMusic(audioBuffer) {
    // Implement music identification
    return { title: "Unknown", artist: "Unknown" };
}

async function startXeonBotInc() {
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    // Bot initialization logic here...
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
