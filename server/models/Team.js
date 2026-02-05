const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a team name'],
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
        },
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Faculty
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Team', teamSchema);
