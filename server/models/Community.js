const mongoose = require('mongoose');

const communitySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a community name'],
        },
        type: {
            type: String,
            enum: ['student-student', 'student-company', 'student-faculty', 'student-group'],
            required: true,
        },
        relatedOpportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
        },
        relatedTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
        },
        createdBy: {
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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Community', communitySchema);
