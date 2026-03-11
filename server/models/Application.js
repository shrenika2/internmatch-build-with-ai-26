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
        matchScore: {
            type: Number,
            default: 0,
        },
        matchBreakdown: {
            type: Object,
        },
        matchNotes: [String],
    },
    {
        timestamps: true,
    }
);

// Optimization Indexes
applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });
applicationSchema.index({ opportunity: 1, status: 1 });
applicationSchema.index({ opportunity: 1, skillMatchScore: -1 });
applicationSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
