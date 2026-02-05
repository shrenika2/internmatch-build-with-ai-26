const mongoose = require('mongoose');

const projectMessageSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
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
        isDoubt: {
            type: Boolean,
            default: false,
        },
        isFacultyReply: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ProjectMessage', projectMessageSchema);
