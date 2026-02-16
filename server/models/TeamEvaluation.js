const mongoose = require('mongoose');

const teamEvaluationSchema = mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'Pending'],
            default: 'Pending',
        },
        feedback: {
            type: String,
        },
        criteria: {
            technicalComplexity: { type: Number, min: 1, max: 10 },
            documentation: { type: Number, min: 1, max: 10 },
            collaboration: { type: Number, min: 1, max: 10 },
            presentation: { type: Number, min: 1, max: 10 }
        },
        isFinalized: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('TeamEvaluation', teamEvaluationSchema);
