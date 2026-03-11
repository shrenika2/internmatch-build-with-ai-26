const asyncHandler = require('express-async-handler');
const Opportunity = require('../models/Opportunity');
const Resource = require('../models/Resource');
const Team = require('../models/Team');
const ProjectMessage = require('../models/ProjectMessage');
const notificationService = require('../services/notificationService');

// @desc    Get faculty posted projects
// @route   GET /api/faculty/projects
// @access  Private (Faculty)
const getFacultyProjects = asyncHandler(async (req, res) => {
    const projects = await Opportunity.find({ postedBy: req.user._id, type: 'project' });
    res.json(projects);
});

// @desc    Get pending team requests for mentor
// @route   GET /api/faculty/teams/pending
// @access  Private (Faculty)
const getPendingTeamRequests = asyncHandler(async (req, res) => {
    const teams = await Team.find({ mentor: req.user._id, status: 'pending' })
        .populate('leader', 'name email avatar')
        .populate('opportunity', 'title');
    res.json(teams);
});

// @desc    Handle team request (Accept/Reject)
// @route   PUT /api/faculty/teams/:teamId
// @access  Private (Faculty)
const handleTeamRequest = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const team = await Team.findById(req.params.teamId).populate('leader').populate('opportunity');

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

    const io = req.app.get('socketio');

    // Create notification for team leader
    await notificationService.sendNotification({
        userId: team.leader._id,
        senderId: req.user._id,
        type: 'system',
        title: `Team Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message: `Professor ${req.user.name} has ${status} your team "${team.name}" for project "${team.opportunity.title}"`,
        link: `/student/dashboard`
    }, io);

    res.json(team);
});

// @desc    Get project messages
// @route   GET /api/faculty/projects/:projectId/messages
// @access  Private
const getProjectMessages = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Security Guard: Verify project access
    const { verifyProjectAccess } = require('../middleware/projectAuth');
    const auth = await verifyProjectAccess(projectId, req.user._id, req.user.role);
    if (!auth.authorized) {
        return res.status(auth.status).json({ success: false, message: auth.message });
    }

    const messages = await ProjectMessage.find({ project: projectId })
        .populate('sender', 'name role')
        .sort('createdAt');
    res.json(messages);
});

// @desc    Save project message
// @route   POST /api/faculty/projects/:projectId/messages
// @access  Private
const postProjectMessage = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { text, isDoubt, isFacultyReply } = req.body;

    // Security Guard: Verify project access before permitting a new message write
    const { verifyProjectAccess } = require('../middleware/projectAuth');
    const auth = await verifyProjectAccess(projectId, req.user._id, req.user.role);
    if (!auth.authorized) {
        return res.status(auth.status).json({ success: false, message: auth.message });
    }

    // Role Enforcement: Only faculty can set isFacultyReply
    const actualIsFacultyReply = req.user.role === 'faculty' ? isFacultyReply : false;

    const message = await ProjectMessage.create({
        project: projectId,
        sender: req.user._id,
        text,
        isDoubt,
        isFacultyReply: actualIsFacultyReply
    });

    const populated = await ProjectMessage.findById(message._id).populate('sender', 'name role');

    res.status(201).json(populated);
});

module.exports = {
    getFacultyProjects,
    getPendingTeamRequests,
    handleTeamRequest,
    getProjectMessages,
    postProjectMessage
};
