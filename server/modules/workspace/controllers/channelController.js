const Channel = require('../models/Channel');

exports.getChannels = async (req, res) => {
  try {
    const { communityId } = req.query;
    const filter = communityId ? { communityId } : {};
    const channels = await Channel.find(filter).sort({ createdAt: 1 });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createChannel = async (req, res) => {
  try {
    const { name, communityId } = req.body;
    const channel = await Channel.create({ name, communityId });

    // Broadcast via socket if IO is available
    const io = req.app.get('io');
    if (io) {
      io.emit('channel_created', channel);
    }

    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
