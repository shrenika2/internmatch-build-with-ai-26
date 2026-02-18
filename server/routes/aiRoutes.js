const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const rateLimit = require('express-rate-limit');
const aiService = require('../services/aiService');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { logAction } = require('../utils/auditService');

// Rate limiter for AI operations (expensive and potential for abuse)
const aiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per window
    message: {
        message: 'Too many resume parsing requests. Please try again in an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// @desc    Parse resume from URL and extract skills
// @route   POST /api/ai/parse-resume
// @access  Private (Student)
router.post('/parse-resume', protect, authorize('student'), aiRateLimiter, asyncHandler(async (req, res) => {
    const { resumeUrl } = req.body;

    if (!resumeUrl) {
        res.status(400);
        throw new Error('Please provide a resume URL');
    }

    // 1. Extract text from PDF
    const text = await aiService.extractTextFromURL(resumeUrl);

    if (!text || text.trim().length < 50) {
        res.status(400);
        throw new Error('Resume text is too short or could not be extracted');
    }

    // 2. AI Skill Extraction
    const extractionResult = await aiService.extractSkills(text);

    // 3. Auto-update student profile
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Merge new skills, avoiding duplicates
    const currentSkills = user.studentProfile.skills || [];
    const newSkills = [...new Set([...currentSkills, ...extractionResult.skills])];

    user.studentProfile.skills = newSkills;
    await user.save();

    // 4. Audit Log
    logAction({
        userId: req.user._id,
        action: 'AI_RESUME_PARSE',
        entityType: 'User',
        entityId: req.user._id,
        metadata: {
            skillsFound: extractionResult.skills.length,
            resumeProcessed: resumeUrl.split('/').pop()
        },
        req
    });

    res.json({
        success: true,
        extractedSkills: extractionResult.skills,
        categories: extractionResult.categories,
        allSkills: user.studentProfile.skills
    });
}));

// @desc    Calculate match score for a specific opportunity
// @route   POST /api/ai/calculate-match
// @access  Private (Student)
router.post('/calculate-match', protect, authorize('student'), asyncHandler(async (req, res) => {
    const { opportunityId } = req.body;
    const Opportunity = require('../models/Opportunity');

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
        res.status(404);
        throw new Error('Opportunity not found');
    }

    const user = await User.findById(req.user._id);
    const resumeSkills = user.studentProfile.parsedSkills || [];
    const requiredSkills = opportunity.requiredSkills || [];

    const score = aiService.calculateMatchScore(resumeSkills, requiredSkills);

    // Filter matched and missing skills
    const rSkills = resumeSkills.map(s => s.toLowerCase().trim());
    const matchedSkills = requiredSkills.filter(reqS =>
        rSkills.some(resS => resS.includes(reqS.toLowerCase()) || reqS.toLowerCase().includes(resS))
    );
    const missingSkills = requiredSkills.filter(reqS => !matchedSkills.includes(reqS));

    res.json({
        success: true,
        score,
        matchedSkills,
        missingSkills
    });
}));

// @desc    Extract skills from Job Description text
// @route   POST /api/ai/extract-jd-skills
// @access  Private (Company/Faculty/Admin)
router.post('/extract-jd-skills', protect, authorize('company', 'faculty', 'admin'), asyncHandler(async (req, res) => {
    const { jdText } = req.body;

    if (!jdText) {
        res.status(400);
        throw new Error('Please provide job description text');
    }

    const { skills } = await aiService.extractJDSkills(jdText);

    res.json({
        success: true,
        skills
    });
}));

module.exports = router;
