const express = require('express');
const router = express.Router();
const Message = require('../models/WorkspaceMessage');

// GET /workspace/messages/:channelId
router.get('/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ channelId })
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ channelId });

    res.json({
      messages: messages.reverse(), // Return oldest first
      total,
      hasMore: total > page * limit
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /workspace/messages/:channelId
router.post('/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { senderId, senderName, content, attachments } = req.body;

    const newMessage = await Message.create({
      channelId,
      senderId,
      senderName,
      content,
      attachments
    });

    const io = req.app.get('io');
    if (io) {
      // Broadcast specifically to the room
      console.log(`Broadcasting to channel_${channelId}:`, newMessage.content);
      io.to(`channel_${channelId}`).emit('message:new', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
