const mongoose = require('mongoose');

const practiceMaterialSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        description: {
            type: String,
        },
        type: {
            type: String,
            enum: ['pdf', 'video', 'link'],
            required: true,
        },
        fileUrl: {
            type: String,
            required: [true, 'Please add a file URL or link'],
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['company', 'faculty'],
            required: true,
        },
        linkedOpportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
        },
        visibility: {
            type: String,
            enum: ['public', 'applicants_only'],
            default: 'public',
        },
        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PracticeMaterial', practiceMaterialSchema);
