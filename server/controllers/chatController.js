const asyncHandler = require('express-async-handler');
const ProjectMessage = require('../models/ProjectMessage');

// @desc    Get chat messages for an opportunity/project
// @route   GET /api/opportunities/:id/messages
// @access  Private
const getOpportunityMessages = asyncHandler(async (req, res) => {
    const messages = await ProjectMessage.find({ project: req.params.id })
        .populate('sender', 'name role')
        .sort('createdAt');
    res.json(messages);
});

// @desc    Post a message to an opportunity/project chat
// @route   POST /api/opportunities/:id/messages
// @access  Private
const postOpportunityMessage = asyncHandler(async (req, res) => {
    const { text, isDoubt, isFacultyReply } = req.body;

    const message = await ProjectMessage.create({
        project: req.params.id,
        sender: req.user._id,
        text,
        isDoubt,
        isFacultyReply
    });

    const populated = await ProjectMessage.findById(message._id)
        .populate('sender', 'name role');

    res.status(201).json(populated);
});

module.exports = {
    getOpportunityMessages,
    postOpportunityMessage,
};
