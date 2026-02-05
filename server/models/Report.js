const mongoose = require('mongoose');

const reportSchema = mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetType: {
            type: String,
            enum: ['post', 'message', 'user', 'opportunity'],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'resolved', 'ignored'],
            default: 'pending',
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        actionTaken: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Report', reportSchema);
