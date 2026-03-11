// Basic bot service for auto-replies
const Message = require('../models/WorkspaceMessage');

const AUTO_REPLIES = {
    'schedule': 'Classes are Mon-Fri from 9 AM to 5 PM.',
    'deadline': 'The project deadline is next Friday!',
    'notes': 'You can find class notes in the #materials channel.',
    'help': 'Type /help to see available commands.',
    'hello': 'Hello there! Welcome to the community.'
};

exports.handleBotReply = async (io, message) => {
    // Only reply to user messages, not other bots (if we had them)
    // Check if text contains keywords
    const lowerText = message.text.toLowerCase();

    for (const key in AUTO_REPLIES) {
        if (lowerText.includes(key)) {
            // Emulate a bot delay
            setTimeout(async () => {
                const replyText = AUTO_REPLIES[key];

                // Save bot message to DB
                try {
                    const botMsg = await Message.create({
                        channelId: message.channelId,
                        senderName: 'Community Bot',
                        text: replyText,
                        // sender: null (or a specific Bot User ID if we had one)
                    });

                    io.to(message.channelId).emit('messageCreated', botMsg);
                } catch (err) {
                    console.error("Bot reply error:", err);
                }
            }, 1000); // 1 second delay

            return; // Reply once per message
        }
    }
};
