const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Message content cannot be empty'],
        },
        isModerated: {
            type: Boolean,
            default: false,
        },
        isSystem: {
            type: Boolean,
            default: false,
        },
        helpfulBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        parentMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null
        },
        readBy: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                readAt: { type: Date, default: Date.now }
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Message', messageSchema);
