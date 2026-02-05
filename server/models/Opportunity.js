const mongoose = require('mongoose');

const opportunitySchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        type: {
            type: String,
            enum: ['internship', 'project'],
            required: true,
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        requiredSkills: [String],
        eligibilityCriteria: {
            minYear: Number,
            minCGPA: Number,
            branches: [String],
        },
        deadline: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'pending_api', 'pending_faculty', 'open', 'closed', 'rejected'],
            default: 'open',
        },
        facultyApprovalRequired: {
            type: Boolean,
            default: false
        },
        location: {
            type: String,
            default: 'Remote',
        },
        stipend: String,
        duration: String,
        maxTeams: {
            type: Number,
            default: 5,
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
        isFlagged: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
