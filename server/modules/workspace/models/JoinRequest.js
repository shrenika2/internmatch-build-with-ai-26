const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema({
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkspaceCommunity',
        required: true
    },
    requesterId: {
        type: String, // String ID for compatibility
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate pending requests
JoinRequestSchema.index({ communityId: 1, requesterId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('JoinRequest', JoinRequestSchema);
