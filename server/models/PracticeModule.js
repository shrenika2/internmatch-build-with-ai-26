const mongoose = require('mongoose');

const practiceModuleSchema = mongoose.Schema(
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
            enum: ['aptitude', 'technical', 'interview', 'coding'],
            required: true,
        },
        contentType: {
            type: String,
            enum: ['pdf', 'link', 'video'],
            required: true,
        },
        fileUrl: {
            type: String,
        },
        externalLink: {
            type: String,
        },
        postedByRole: {
            type: String,
            enum: ['company', 'faculty'],
            required: true,
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the company user
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the faculty user
        },
        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
        },
        visibilityRules: {
            batch: [String],
            department: [String],
            openToAll: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PracticeModule', practiceModuleSchema);
