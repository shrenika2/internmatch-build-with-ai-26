const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'review', 'done'],
            default: 'todo',
        },
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        dueDate: {
            type: Date,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        statusHistory: [
            {
                status: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);
