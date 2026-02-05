const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');

// @desc    Create team and request mentorship
// @route   POST /api/teams
// @access  Private (Student)
const createTeam = asyncHandler(async (req, res) => {
    const { name, projectId, memberIds } = req.body;

    const project = await Opportunity.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const team = await Team.create({
        name,
        project: projectId,
        leader: req.user._id,
        members: memberIds || [],
        mentor: project.postedBy, // Automatically set mentor as project poster (faculty)
    });

    // Notify faculty in real time
    const notification = await Notification.create({
        recipient: project.postedBy,
        sender: req.user._id,
        type: 'system',
        title: 'New Team Mentorship Request',
        message: `Team "${name}" has requested mentorship for your project "${project.title}"`,
        link: `/faculty/dashboard`, // Assuming faculty dashboard shows team requests
    });

    const io = req.app.get('socketio');
    if (io) {
        io.to(`faculty:${project.postedBy}`).emit('team_request', { team, notification });
        io.to(project.postedBy.toString()).emit('notification', notification);
    }

    res.status(201).json(team);
});

// @desc    Get my teams
// @route   GET /api/teams/my
// @access  Private
const getMyTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({
        $or: [
            { leader: req.user._id },
            { members: req.user._id }
        ]
    }).populate('project').populate('mentor', 'name email');
    res.json(teams);
});

module.exports = {
    createTeam,
    getMyTeams,
};
