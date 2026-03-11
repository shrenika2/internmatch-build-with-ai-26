const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');

// GET /workspace/channels
router.get('/', async (req, res) => {
  try {
    const { communityId } = req.query;
    const filter = communityId ? { communityId } : {};
    const channels = await Channel.find(filter).sort({ createdAt: 1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /workspace/channels
router.post('/', async (req, res) => {
  try {
    const { name, type, communityId } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const newChannel = await Channel.create({ name, type: type || 'text', communityId });

    // Valid Socket Emit
    const io = req.app.get('io');
    if (io) {
      io.emit('channel:new', newChannel);
    }

    res.status(201).json(newChannel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
