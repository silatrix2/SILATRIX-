const { isAdmin } = require('../lib/isAdmin');

// Function to handle manual promotions via command
async function promoteCommand(sock, chatId, mentionedJids, message) {
    let userToPromote = [];
    
    // Check for mentioned users
    if (mentionedJids && mentionedJids.length > 0) {
        userToPromote = mentionedJids;
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    // If no user found through either method
    if (userToPromote.length === 0) {
        await sock.sendMessage(chatId, { 
            text: '👑 *Royal Decree:* Please mention the noble or reply to their message for promotion!'
        });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");
        
        // Get usernames for each promoted user
        const usernames = await Promise.all(userToPromote.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        // Get promoter's name (the bot user in this case)
        const promoterJid = sock.user.id;
        
        const promotionMessage = `
╔══════◇══════╗
  🏰 *『 ROYAL PROMOTION 』* 🏰
╟─────────────╢
✨ *New Royalty:*  
${usernames.map(name => `   👑 ${name}`).join('\n')}
  
⚔️ *Knighted By:* @${promoterJid.split('@')[0]}  
📅 *Date of Coronation:* ${new Date().toLocaleString()}  
╚══════◇══════╝
`.trim();
        
        await sock.sendMessage(chatId, { 
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid]
        });
    } catch (error) {
        console.error('Error in promote command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *The Royal Court Declares:* Promotion failed!'
        });
    }
}

// Function to handle automatic promotion detection
async function handlePromotionEvent(sock, groupId, participants, author) {
    try {
        // Get usernames for promoted participants
        const promotedUsernames = await Promise.all(participants.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        let promotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            const authorJid = author;
            promotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            promotedBy = '⚜️ *The Royal System*';
        }

        const promotionMessage = `
╔══════◇══════╗
  🏰 *『 ROYAL PROMOTION 』* 🏰
╟─────────────╢
✨ *New Royalty:*  
${promotedUsernames.map(name => `   👑 ${name}`).join('\n')}
  
⚔️ *Knighted By:* ${promotedBy}  
📅 *Date of Coronation:* ${new Date().toLocaleString()}  
╚══════◇══════╝
`.trim();
        
        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling promotion event:', error);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };