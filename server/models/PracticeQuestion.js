const mongoose = require('mongoose');

const practiceQuestionSchema = mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            enum: ['coding', 'aptitude', 'core', 'hr'],
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
        },
        question: {
            type: String,
            required: [true, 'Please add the question text'],
        },
        options: [String], // Useful for aptitude/core
        answer: {
            type: String,
            required: [true, 'Please add the correct answer'],
        },
        skills: [String],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PracticeQuestion', practiceQuestionSchema);
