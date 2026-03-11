const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  // Allows "user_demo_123" strings without valid ObjectId
  senderId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Added for compliance
  senderName: { type: String, required: true },

  content: { type: String, default: '' },

  attachments: [{
    url: String,
    type: { type: String }, // 'image', 'file'
    name: String,
    size: Number
  }],

  // --- THREAD EXTENSION ---
  parentMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMessage', default: null },
  isThread: { type: Boolean, default: false },
  // ------------------------

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkspaceMessage', MessageSchema);
