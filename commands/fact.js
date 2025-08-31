const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = async function (sock, chatId, message) {
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const fact = response.data.text;

        // Resolve the local image path
        const imagePath = path.join(__dirname, '../assets/facts.jpg');

        // Send local image with caption
        await sock.sendMessage(chatId, {
            image: fs.readFileSync(imagePath),
            caption: `🧠 *Random Fact of the Day*\n\n${fact}`
        }, { quoted: message });

    } catch (error) {
        console.error('Error fetching fact:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Sorry, I couldn’t retrieve a fact right now. Please try again later.'
        }, { quoted: message });
    }
};
