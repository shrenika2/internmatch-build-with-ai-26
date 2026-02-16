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

module.exports = router;
