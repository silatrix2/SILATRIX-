// bot.js
let sockInstance;

module.exports = {
    setSock: (sock) => { sockInstance = sock },
    getSock: () => sockInstance
};
