const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/favourodoemenechidozie/QUEEN-EMILY-MD');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `*乂  SILATRIX MD  乂*\n\n`; 
    txt += `✩  *Name* : ${json.name}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
    
    // Channel link below repo stuff
    txt += `📢 *Join Our WhatsApp Channel:* [for updates click here ](https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L)\n\n`;
    
    txt += `*SILATRIX MD*`;

    // Use the local asset image
    const imgPath = path.join(__dirname, '../assets/darkqueen.jpg');
    const imgBuffer = fs.readFileSync(imgPath);

    await sock.sendMessage(
      chatId, 
      { image: imgBuffer, caption: txt }, 
      { quoted: message }
    );

  } catch (error) {
    await sock.sendMessage(chatId, { text: '❌ Error fetching repository information.' }, { quoted: message });
  }
}

module.exports = githubCommand;
