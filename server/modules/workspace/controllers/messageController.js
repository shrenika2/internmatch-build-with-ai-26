const Message = require('../models/WorkspaceMessage');

// API: Send Message (Fallback/HTTP method)
exports.sendMessage = async (req, res) => {
  try {
    const { channelId, senderName, text } = req.body;
    const msg = await Message.create({ channelId, senderName, text });

    // Broadcast if using API
    const io = req.app.get('io');
    if (io) {
      io.to(`channel_${channelId}`).emit('receive_message', msg);
    }

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API: Get Messages
exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50, search } = req.query;

    const query = { channelId };

    // Search
    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    // .populate removed because sender is String (demo user)

    const total = await Message.countDocuments(query);

    res.json({
      messages: messages.reverse(), // Return oldest first for chat flow
      total,
      hasMore: total > page * limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
