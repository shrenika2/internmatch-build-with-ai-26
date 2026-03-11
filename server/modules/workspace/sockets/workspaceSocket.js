module.exports = (io, socket) => {
    // 1. Join Room (Channel) with Strict Isolation
    socket.on('join-room', async (channelId) => {
        if (!channelId) return;

        // RULE: Force leave all other rooms to prevent message leakage
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });

        // Use strict channel ID as room name
        socket.join(channelId);
        console.log(`Socket ${socket.id} joined channel room: ${channelId}`);

        // LOAD MESSAGES (Server-side fetch as requested)
        try {
            const Message = require('../models/WorkspaceMessage');
            const messages = await Message.find({ channelId }).sort({ createdAt: 1 }).limit(50);

            // Emit ONLY to the user who joined
            socket.emit('load-messages', messages);
        } catch (err) {
            console.error("Error loading messages for channel:", channelId, err);
        }
    });

    // 2. Send Message (Strict to Room)
    socket.on('send-message', async ({ room, user, text, attachments }) => {
        try {
            if (!room || (!text && (!attachments || attachments.length === 0))) return;

            const Message = require('../models/WorkspaceMessage');

            // Store per channel (in DB)
            const savedMessage = await Message.create({
                channelId: room,
                senderId: user._id || user.id,
                senderName: user.name || 'User',
                content: text || '',
                attachments: attachments || [],
                createdAt: new Date()
            });

            // RULE: io.to(channelName).emit() - NEVER global
            io.to(room).emit('receive-message', savedMessage);

        } catch (e) {
            console.error("Socket send-message error:", e);
        }
    });

    // 3. Create Channel
    socket.on('create_channel', async (name) => {
        try {
            if (!name) return;
            const Channel = require('../models/Channel');
            const channel = await Channel.create({ name });

            // Broadcast globally
            io.emit('channel_created', channel);
        } catch (e) {
            console.error("Create channel error:", e);
        }
    });

    // 4. Delete Channel
    socket.on('delete_channel', async (channelId) => {
        try {
            if (!channelId) return;
            const Channel = require('../models/Channel');
            const Message = require('../models/WorkspaceMessage');

            await Channel.findByIdAndDelete(channelId);
            await Message.deleteMany({ channelId }); // Clean up messages

            // Broadcast globally as channel list is global
            io.emit('channel_deleted', channelId);
        } catch (e) {
            console.error("Delete channel error:", e);
        }
    });

    // 4. Delete Message
    socket.on('delete_message', async ({ channelId, messageId }) => {
        try {
            if (!messageId) return;
            const Message = require('../models/WorkspaceMessage');

            await Message.findByIdAndDelete(messageId);

            // Emit strictly to room
            io.to(channelId).emit('message_deleted', messageId);
        } catch (e) {
            console.error("Delete message error:", e);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
};
