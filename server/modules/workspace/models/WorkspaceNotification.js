const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['mention', 'reply', 'reaction', 'system'], required: true },
  content: String,
  relatedChannelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  relatedMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkspaceMessage' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('WorkspaceNotification', NotificationSchema);
