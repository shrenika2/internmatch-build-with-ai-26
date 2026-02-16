const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema(
    {
        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        resume: {
            type: String,
            required: [true, 'Please upload a resume file'],
        },

        coverLetter: {
            type: String,
        },
        status: {
            type: String,
            enum: ['applied', 'shortlisted', 'accepted', 'rejected'],
            default: 'applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        score: {
            type: Number,
            default: 0,
        },
        resumeSkills: {
            type: [String],
            default: []
        },
        skillMatchScore: {
            type: Number,
            default: 0,
        },
        matchNotes: [String],
    },
    {
        timestamps: true,
    }
);

// Prevent multiple applications for the same opportunity
applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
