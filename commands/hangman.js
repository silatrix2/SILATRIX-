const fs = require('fs');

const words = ['javascript', 'bot', 'hangman', 'whatsapp', 'nodejs'];
let hangmanGames = {};

function startHangman(sock, chatId) {
    const word = words[Math.floor(Math.random() * words.length)];
    const maskedWord = '_ '.repeat(word.length).trim();

    hangmanGames[chatId] = {
        word,
        maskedWord: maskedWord.split(' '),
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
    };

    sock.sendMessage(chatId, { text: `🎮 Hangman Game Started!\nGuess the word: ${maskedWord}` });
}

function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { text: '❌ No game in progress!\nType *.hangman* to start a new game.' });
        return;
    }

    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { text: `⚠️ You've already guessed "${letter}". Try something else!` });
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                maskedWord[i] = letter;
            }
        }
        sock.sendMessage(chatId, { text: `✅ Nice one!\nCurrent word: ${maskedWord.join(' ')}` });

        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, { text: `🏆 You did it! The word was: *${word}*` });
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses += 1;
        sock.sendMessage(chatId, { text: `❌ Oops! Wrong letter.\nYou have *${maxWrongGuesses - game.wrongGuesses}* tries left.` });

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { text: `💀 Game over! The word was: *${word}*` });
            delete hangmanGames[chatId];
        }
    }
}

module.exports = { startHangman, guessLetter };
