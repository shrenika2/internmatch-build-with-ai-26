const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a team name'],
        },
        opportunity: {
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
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                role: {
                    type: String,
                    enum: ['Lead', 'Frontend', 'Backend', 'ML', 'Design', 'Marketing', 'App', 'DevOps'],
                    default: 'Frontend'
                },
                status: {
                    type: String,
                    enum: ['pending', 'accepted', 'rejected'],
                    default: 'pending'
                }
            },
        ],
        isLocked: {
            type: Boolean,
            default: false
        },
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Team', teamSchema);
