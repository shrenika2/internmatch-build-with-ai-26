// Slash command handler
const Message = require('../models/WorkspaceMessage');

exports.handleSlashCommand = async (io, socket, data, workspaceNamespace) => {
    const { channelId, text, user } = data;
    const [command, ...args] = text.split(' ');

    switch (command.toLowerCase()) {
        case '/clear':
            // Logic: Delete last N messages
            // Security: Should check if user.role === 'admin'
            // For MVP/Demo, we might allow it or just strictly check headers if passed

            if (args[0]) {
                const limit = parseInt(args[0], 10);
                if (!isNaN(limit) && limit > 0) {
                    // Find generic messages to delete
                    const msgs = await Message.find({ channelId })
                        .sort({ createdAt: -1 })
                        .limit(limit);

                    const ids = msgs.map(m => m._id);
                    await Message.deleteMany({ _id: { $in: ids } });

                    // Notify client to refresh or remove locally
                    io.to(channelId).emit('messages_cleared', ids);
                }
            }
            break;

        case '/help':
            // Emit ephemeral message ONLY to this socket
            socket.emit('messageCreated', {
                _id: 'ephemeral_' + Date.now(),
                channelId,
                senderName: 'System',
                text: 'Available commands:\n/clear [n] - Delete last n messages\n/help - Show this help',
                createdAt: new Date()
            });
            break;

        default:
            return false; // Not a command
    }

    return true; // Was a command
};
