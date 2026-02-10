const mongoose = require('mongoose');

const studentExperienceSchema = mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        opportunityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
        },
        type: {
            type: String,
            enum: ['text', 'video'],
            required: true,
        },
        content: {
            type: String,
            required: function () {
                return this.type === 'text';
            },
        },
        videoUrl: {
            type: String,
            required: function () {
                return this.type === 'video';
            },
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        rounds: [
            {
                name: String,
                description: String
            }
        ],
        tips: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('StudentExperience', studentExperienceSchema);
