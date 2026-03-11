const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'announcement'],
    default: 'text'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkspaceCommunity',
    required: true
  }
});

module.exports = mongoose.model('Channel', ChannelSchema);
