const Message = require('../models/WorkspaceMessage');
// Adjust path: workspace/threads/threadController.js -> workspace/models/Message.js is ../models/Message.js

exports.getThreadMessages = async (req, res) => {
    try {
        const { messageId } = req.params;
        const replies = await Message.find({ parentMessageId: messageId }).sort({ createdAt: 1 });
        res.json(replies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.postThreadMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { senderId, senderName, content, channelId } = req.body;

        const reply = await Message.create({
            channelId,
            parentMessageId: messageId,
            isThread: true,
            senderId,
            senderName,
            content
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`thread_${messageId}`).emit('thread:message', reply);
        }

        res.status(201).json(reply);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
