const asyncHandler = require('express-async-handler');
const Opportunity = require('../models/Opportunity');
const Resource = require('../models/Resource');
const Team = require('../models/Team');
const ProjectMessage = require('../models/ProjectMessage');
const Notification = require('../models/Notification');

// @desc    Get faculty projects
// @route   GET /api/faculty/projects
// @access  Private (Faculty)
const getFacultyProjects = asyncHandler(async (req, res) => {
    const projects = await Opportunity.find({ postedBy: req.user._id, type: 'project' });
    res.json(projects);
});

// @desc    Handle team request (Accept/Reject)
// @route   PUT /api/faculty/teams/:teamId
// @access  Private (Faculty)
const handleTeamRequest = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const team = await Team.findById(req.params.teamId).populate('leader').populate('project');

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (team.mentor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to mentor this team');
    }

    team.status = status;
    await team.save();

    // Create notification for team leader
    const notification = await Notification.create({
        recipient: team.leader._id,
        sender: req.user._id,
        type: 'system',
        title: `Team Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message: `Professor ${req.user.name} has ${status} your team "${team.name}" for project "${team.project.title}"`,
        link: `/student/dashboard`,
    });

    const io = req.app.get('socketio');
    if (io) {
        io.to(team.leader._id.toString()).emit('notification', notification);
    }

    res.json(team);
});

// @desc    Get project messages
// @route   GET /api/faculty/projects/:projectId/messages
// @access  Private
const getProjectMessages = asyncHandler(async (req, res) => {
    const messages = await ProjectMessage.find({ project: req.params.projectId })
        .populate('sender', 'name role')
        .sort('createdAt');
    res.json(messages);
});

// @desc    Save project message
// @route   POST /api/faculty/projects/:projectId/messages
// @access  Private
const postProjectMessage = asyncHandler(async (req, res) => {
    const { text, isDoubt, isFacultyReply } = req.body;

    const message = await ProjectMessage.create({
        project: req.params.projectId,
        sender: req.user._id,
        text,
        isDoubt,
        isFacultyReply
    });

    const populated = await ProjectMessage.findById(message._id).populate('sender', 'name role');

    res.status(201).json(populated);
});

module.exports = {
    getFacultyProjects,
    handleTeamRequest,
    getProjectMessages,
    postProjectMessage
};
