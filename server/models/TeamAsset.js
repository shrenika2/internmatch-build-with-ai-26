const mongoose = require('mongoose');

const teamAssetSchema = mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['link', 'file', 'credential'],
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('TeamAsset', teamAssetSchema);
