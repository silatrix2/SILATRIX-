const fs = require('fs');
const path = require('path');

// 200 truths stored here
const truths = [
    "What is the biggest lie you’ve ever told?",
    "Who was your first crush?",
    "What’s one secret you’ve never told anyone?",
    "Have you ever cheated in a test?",
    "What’s the most embarrassing thing you’ve ever done?",
    "Who do you text the most?",
    "Have you ever lied to your best friend?",
    "What’s your worst habit?",
    "What’s your biggest fear?",
    "Have you ever been caught doing something you shouldn’t?",
    "What’s the meanest thing you’ve ever said to someone?",
    "Have you ever broken a promise?",
    "What’s your guilty pleasure?",
    "Who would you call first if you were in trouble?",
    "What’s your most childish habit?",
    "Have you ever had a crush on a teacher?",
    "What’s your worst date experience?",
    "Have you ever stolen something?",
    "Who is the last person you stalked on social media?",
    "What’s the weirdest dream you’ve had?",
    "Have you ever lied to get out of trouble?",
    "What’s the silliest thing you’re afraid of?",
    "Who is your secret celebrity crush?",
    "Have you ever been in love?",
    "What’s your most embarrassing childhood memory?",
    "Have you ever faked being sick to skip school?",
    "What’s something you’ve done that you regret?",
    "Have you ever lied to your parents?",
    "What’s your favorite guilty pleasure snack?",
    "Have you ever sent a text to the wrong person?",
    "What’s your weirdest habit?",
    "Who is your favorite family member?",
    "What’s your biggest insecurity?",
    "Have you ever been jealous of a friend?",
    "What’s a secret talent you have?",
    "What’s the most awkward situation you’ve been in?",
    "Have you ever eavesdropped on someone?",
    "What’s the last lie you told?",
    "Have you ever been caught lying?",
    "What’s your wildest fantasy?",
    "Who would you marry if you had to choose someone from this group?",
    "Have you ever kissed someone in public?",
    "What’s the dumbest thing you’ve done?",
    "Have you ever had a crush on your friend’s partner?",
    "What’s your favorite thing to do when no one is watching?",
    "Have you ever been in trouble at school?",
    "What’s the worst thing you’ve ever said to a teacher?",
    "Who do you talk to most on the phone?",
    "Have you ever spread a rumor?",
    "What’s your dream job?",
    "Have you ever lied about your age?",
    "What’s your favorite childhood cartoon?",
    "Who do you miss the most?",
    "Have you ever ghosted someone?",
    "What’s the longest you’ve gone without a shower?",
    "Have you ever pretended to like a gift?",
    "What’s the strangest thing you’ve eaten?",
    "What’s your most awkward date experience?",
    "Have you ever lied about where you were going?",
    "Who is your favorite teacher?",
    "What’s one thing you’d change about yourself?",
    "Have you ever been caught sneaking out?",
    "What’s your favorite romantic movie?",
    "Have you ever cheated in a game?",
    "What’s the most trouble you’ve gotten into?",
    "What’s your go-to excuse?",
    "Who’s the last person you texted?",
    "What’s your favorite dessert?",
    "Have you ever lied to a teacher?",
    "What’s your favorite holiday?",
    "Have you ever made up a story to impress someone?",
    "What’s the silliest lie you’ve told?",
    "What’s your favorite song right now?",
    "Have you ever been scared of the dark?",
    "What’s your favorite childhood toy?",
    "Have you ever lied in Truth or Dare?",
    "Who would you like to trade lives with for a day?",
    "What’s your favorite thing about yourself?",
    "Have you ever been stood up?",
    "What’s the most money you’ve ever found?",
    "Have you ever peeked at someone’s phone?",
    "What’s your worst cooking fail?",
    "What’s your dream travel destination?",
    "Have you ever kept a diary?",
    "What’s the funniest thing you’ve done?",
    "Have you ever been caught cheating?",
    "What’s your favorite memory?",
    "What’s your biggest pet peeve?",
    "What’s your weirdest nickname?",
    "Have you ever fallen asleep in class?",
    "What’s your favorite animal?",
    "What’s the strangest rumor you’ve heard about yourself?",
    "Have you ever had a fake social media account?",
    "What’s the best compliment you’ve received?",
    "What’s your favorite time of year?",
    "What’s the silliest thing you’ve done for love?",
    "Have you ever lied on social media?",
    "What’s the longest time you’ve gone without talking to your best friend?",
    "What’s your favorite ice cream flavor?",
    "Have you ever been grounded?",
    "What’s the best gift you’ve received?",
    "Have you ever been caught sneaking food?",
    "What’s your favorite TV show?",
    "What’s your most awkward school memory?",
    "What’s your biggest secret?",
    "Have you ever lied about liking someone?",
    "What’s the most expensive thing you own?",
    "What’s your dream house like?",
    "What’s your worst fashion mistake?",
    "Have you ever broken something and blamed someone else?",
    "What’s your favorite color?",
    "What’s your favorite pizza topping?",
    "What’s your biggest regret?",
    "Have you ever been embarrassed in public?",
    "What’s your most used emoji?",
    "Have you ever told a secret you weren’t supposed to?",
    "What’s your favorite holiday tradition?",
    "What’s the weirdest compliment you’ve gotten?",
    "Have you ever laughed at the wrong time?",
    "What’s the strangest gift you’ve received?",
    "What’s your favorite game?",
    "Have you ever been scared of someone?",
    "What’s your favorite hobby?",
    "What’s your most embarrassing moment?",
    "Have you ever had a crush on a stranger?",
    "What’s your weirdest food craving?",
    "What’s the longest you’ve stayed up?",
    "Have you ever forgotten someone’s birthday?",
    "What’s your worst travel experience?",
    "What’s the first thing you’d do if you were invisible?",
    "Have you ever been caught daydreaming?",
    "What’s your favorite thing to do on weekends?",
    "Have you ever lied about doing homework?",
    "What’s your most embarrassing school moment?",
    "Have you ever been caught talking in class?",
    "What’s your favorite thing to wear?",
    "What’s your dream car?",
    "What’s the strangest thing you’ve done when bored?",
    "What’s the last movie you watched?",
    "What’s your favorite song lyric?",
    "Have you ever fallen asleep in public?",
    "What’s the most childish thing you still do?",
    "What’s your most embarrassing fashion moment?",
    "What’s your worst haircut?",
    "What’s your favorite smell?",
    "What’s your weirdest fear?",
    "What’s your best school subject?",
    "What’s the most embarrassing picture of you?",
    "What’s your dream vacation?",
    "What’s your favorite number?",
    "What’s your favorite social media app?",
    "What’s your least favorite food?",
    "What’s your favorite quote?",
    "What’s your favorite store?",
    "What’s your worst injury?",
    "What’s your favorite sports team?",
    "What’s your most embarrassing sports moment?",
    "What’s your favorite fast-food restaurant?",
    "What’s your least favorite chore?",
    "What’s your favorite type of music?",
    "What’s your weirdest superstition?",
    "What’s your favorite family tradition?",
    "What’s your most embarrassing holiday story?",
    "What’s your weirdest memory?",
    "What’s your favorite pet?",
    "What’s your favorite video game?",
    "What’s your favorite movie?",
    "What’s your favorite emoji?",
    "What’s your most embarrassing selfie?",
    "What’s your dream wedding like?",
    "What’s your weirdest hobby?",
    "What’s your favorite vacation memory?"
];

// Variables to handle no-repeat functionality
let shuffledTruths = [];
let currentIndex = 0;

// Shuffle function
function shuffleTruths() {
    shuffledTruths = [...truths];
    for (let i = shuffledTruths.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTruths[i], shuffledTruths[j]] = [shuffledTruths[j], shuffledTruths[i]];
    }
    currentIndex = 0;
}

// Initialize shuffle at start
shuffleTruths();

async function truthCommand(sock, chatId, message) {
    try {
        // Get current truth and move to next
        const truthMessage = shuffledTruths[currentIndex];
        currentIndex++;

        // If we've gone through all truths, reshuffle
        if (currentIndex >= shuffledTruths.length) {
            shuffleTruths();
        }

        // Path to your image
        const imagePath = path.join(__dirname, '../assets/truth.jpg');
        if (!fs.existsSync(imagePath)) {
            throw new Error('Royal truth image not found in assets!');
        }

        const formattedText = `🧠 *ROYAL TRUTH CHALLENGE* 🧠\n\n👑 *Presented by:* SILATRIX MD\n\n🔎 *Truth:* ${truthMessage}\n\n⚠️ This is for fun. Answer honestly if you dare!`;

        const imageFile = fs.readFileSync(imagePath);

        await sock.sendMessage(chatId, {
            image: imageFile,
            caption: formattedText,
            mimetype: 'image/jpeg'
        }, { quoted: message });

    } catch (error) {
        console.error('Royal Truth Error:', error);
        await sock.sendMessage(chatId, {
            text: '👑 *The Royal Court Declares:* Could not retrieve a truth at this time!',
        }, { quoted: message });
    }
}

module.exports = { truthCommand };
