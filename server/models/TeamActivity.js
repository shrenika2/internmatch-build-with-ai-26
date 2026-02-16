const mongoose = require('mongoose');

const teamActivitySchema = mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'ASSET_UPLOADED', 'MEMBER_JOINED', 'STATUS_CHANGE', 'PROJECT_LOCKED'],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('TeamActivity', teamActivitySchema);
