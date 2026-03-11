const mongoose = require('mongoose');

const channelMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique user-channel pair
channelMemberSchema.index({ userId: 1, channelId: 1 }, { unique: true });

module.exports = mongoose.model('ChannelMember', channelMemberSchema);
