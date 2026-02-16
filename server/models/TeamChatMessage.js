const mongoose = require('mongoose');

const teamChatMessageSchema = mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        attachments: [
            {
                name: String,
                url: String,
                fileType: String,
            }
        ],
        readBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                at: {
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

module.exports = mongoose.model('TeamChatMessage', teamChatMessageSchema);
