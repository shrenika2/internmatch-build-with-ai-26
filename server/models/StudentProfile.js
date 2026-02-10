const mongoose = require('mongoose');

const studentProfileSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: [true, 'Please add your full name'],
        },
        branch: {
            type: String,
            required: [true, 'Please add your branch'],
        },
        year: {
            type: Number,
            required: [true, 'Please add your current year'],
        },
        collegeId: {
            type: String,
            required: [true, 'Please add your college ID / Registration Number'],
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot be more than 500 characters'],
        },
        skills: [String],
        techStack: [String],
        cpProfiles: {
            leetcode: String,
            codeforces: String,
            codechef: String,
        },
        links: {
            linkedin: {
                type: String,
                match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please use a valid LinkedIn URL'],
            },
            github: {
                type: String,
                match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Please use a valid GitHub URL'],
            },
            portfolio: String,
        },
        resumeUrl: String,
        experiences: [
            {
                title: String,
                company: String,
                description: String,
                startDate: Date,
                endDate: Date,
                isCurrent: Boolean,
            },
        ],
        isComplete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware to calculate completeness before saving
studentProfileSchema.pre('save', function (next) {
    const hasBasicInfo = this.fullName && this.branch && this.year;
    const hasSkills = this.skills && this.skills.length > 0;
    const hasResume = !!this.resumeUrl;

    this.isComplete = !!(hasBasicInfo && hasSkills && hasResume);
    next();
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
