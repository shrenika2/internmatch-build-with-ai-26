const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Using String to support existing frontend user IDs (e.g. 'user_123')
    creatorId: {
        type: String,
        required: true
    },
    members: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WorkspaceCommunity', CommunitySchema);
