const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const aiService = require('../services/aiService');
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

// @desc    Get interview session and context
// @route   POST /api/interview/session
// @access  Private (Student)
const createInterviewSession = asyncHandler(async (req, res) => {
    const { opportunityId } = req.body;

    if (!opportunityId) {
        res.status(400);
        throw new Error('Please provide an opportunity ID');
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
        res.status(404);
        throw new Error('Opportunity not found');
    }

    const user = await User.findById(req.user._id);
    const candidateSkills = user.studentProfile.parsedSkills || [];
    const jobRequirements = opportunity.requiredSkills || [];
    const roleDescription = opportunity.title;

    // Generate Interview Prompt
    const systemPrompt = aiService.generateInterviewPrompt(candidateSkills, jobRequirements, roleDescription);

    // Create OpenAI Realtime Session (Ephemeral Token)
    try {
        const response = await axios.post('https://api.openai.com/v1/realtime/sessions', {
            model: "gpt-4o-realtime-preview-2024-10-01",
            modalities: ["audio", "text"],
            instructions: systemPrompt,
        }, {
            headers: {
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        res.json({
            success: true,
            client_secret: response.data.client_secret,
            systemPrompt,
            opportunityTitle: opportunity.title
        });
    } catch (error) {
        logger.error(`[INTERVIEW_CONTROLLER] OpenAI Session Error: ${error.response?.data || error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize AI interview session',
            error: error.response?.data || error.message
        });
    }
});

module.exports = {
    createInterviewSession
};
