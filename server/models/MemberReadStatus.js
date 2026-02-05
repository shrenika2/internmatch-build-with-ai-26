const mongoose = require('mongoose');

const memberReadStatusSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community',
            required: true,
        },
        lastReadAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Unique index for quick lookup per user per community
memberReadStatusSchema.index({ user: 1, community: 1 }, { unique: true });

module.exports = mongoose.model('MemberReadStatus', memberReadStatusSchema);
