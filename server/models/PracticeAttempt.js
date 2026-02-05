const mongoose = require('mongoose');

const practiceAttemptSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PracticeQuestion',
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
        timeTaken: {
            type: Number, // in seconds
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PracticeAttempt', practiceAttemptSchema);
