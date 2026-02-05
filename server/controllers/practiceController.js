const asyncHandler = require('express-async-handler');
const PracticeQuestion = require('../models/PracticeQuestion');
const PracticeAttempt = require('../models/PracticeAttempt');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// @desc    Get practice questions for a specific company
// @route   GET /api/practice/company/:companyId
// @access  Private
const getPracticeByCompany = asyncHandler(async (req, res) => {
    const questions = await PracticeQuestion.find({ company: req.params.companyId });
    res.json(questions);
});

// @desc    Post a practice attempt
// @route   POST /api/practice/attempt
// @access  Private (Student only)
const postAttempt = asyncHandler(async (req, res) => {
    const { questionId, isCorrect, timeTaken } = req.body;

    const attempt = await PracticeAttempt.create({
        student: req.user._id,
        question: questionId,
        isCorrect,
        timeTaken,
    });

    res.status(201).json(attempt);
});

// @desc    Get readiness score and insights
// @route   GET /api/practice/readiness/:studentId
// @access  Private
const getReadinessScore = asyncHandler(async (req, res) => {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId);

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // 1. Calculate Accuracy & Consistency
    const attempts = await PracticeAttempt.find({ student: studentId }).populate('question');
    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
        return res.json({
            readinessScore: 0,
            insights: "Start practicing to see your readiness score.",
            accuracy: 0,
            skillGaps: []
        });
    }

    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const accuracy = (correctAttempts / totalAttempts) * 100;

    // 2. Skill Match Logic
    // Get student skills
    const studentSkills = student.studentProfile?.skills || [];

    // Get average skills required for open opportunities
    const opportunities = await Opportunity.find({ status: 'open' });
    const allRequiredSkills = opportunities.reduce((acc, op) => [...acc, ...op.requiredSkills], []);
    const uniqueRequiredSkills = [...new Set(allRequiredSkills)];

    const matchedSkills = studentSkills.filter(skill => uniqueRequiredSkills.includes(skill));
    const skillMatchScore = uniqueRequiredSkills.length > 0 ? (matchedSkills.length / uniqueRequiredSkills.length) * 100 : 100;

    // 3. Simple Readiness Formula
    // 60% Accuracy + 40% Skill Match
    const readinessScore = Math.round((accuracy * 0.6) + (skillMatchScore * 0.4));

    // 4. Skill Gaps
    const skillGaps = uniqueRequiredSkills.filter(skill => !studentSkills.includes(skill)).slice(0, 5);

    res.json({
        readinessScore,
        accuracy: Math.round(accuracy),
        skillMatchScore: Math.round(skillMatchScore),
        totalAttempts,
        skillGaps,
        insights: readinessScore > 70
            ? "You're doing great! Keep it up for top-tier companies."
            : "Focus on accuracy and expanding your skill set.",
    });
});

module.exports = {
    getPracticeByCompany,
    postAttempt,
    getReadinessScore,
};
