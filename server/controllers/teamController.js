const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create team
// @route   POST /api/teams
// @access  Private (Student)
const createTeam = asyncHandler(async (req, res) => {
    const { name, opportunityId } = req.body;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
        res.status(404);
        throw new Error('Opportunity not found');
    }

    const team = await Team.create({
        name,
        opportunity: opportunityId,
        leader: req.user._id,
        members: [{
            user: req.user._id,
            role: 'Lead',
            status: 'accepted'
        }]
    });

    res.status(201).json(team);
});

// @desc    Invite member to team
// @route   POST /api/teams/:id/invite
// @access  Private (Team Lead)
const inviteMember = asyncHandler(async (req, res) => {
    const { identifier, role } = req.body; // email or studentID
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (team.leader.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only team lead can invite members');
    }

    if (team.isLocked) {
        res.status(400);
        throw new Error('Team is locked and cannot add more members');
    }

    // Find user by email or studentID
    const user = await User.findOne({
        $or: [
            { email: identifier },
            { 'studentProfile.studentID': identifier }
        ]
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if user is already in team
    const isAlreadyMember = team.members.some(m => m.user.toString() === user._id.toString());
    if (isAlreadyMember) {
        res.status(400);
        throw new Error('User is already in the team');
    }

    team.members.push({
        user: user._id,
        role: role || 'Frontend',
        status: 'pending'
    });

    await team.save();

    // Notify user
    const notification = await Notification.create({
        recipient: user._id,
        sender: req.user._id,
        type: 'system',
        title: 'Team Invitation',
        message: `${req.user.name} invited you to join team "${team.name}"`,
        link: `/student/dashboard`
    });

    const io = req.app.get('socketio');
    if (io) {
        io.to(user._id.toString()).emit('notification', notification);
    }

    res.json(team);
});

// @desc    Respond to invitation
// @route   PUT /api/teams/:id/respond
// @access  Private
const respondToInvite = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const memberIndex = team.members.findIndex(m => m.user.toString() === req.user._id.toString());
    if (memberIndex === -1) {
        res.status(403);
        throw new Error('Inivtation not found');
    }

    team.members[memberIndex].status = status;

    // If rejected, maybe remove from array or keep as rejected record?
    // Let's keep it but allow filtering out later.

    await team.save();

    // Notify lead
    const notification = await Notification.create({
        recipient: team.leader,
        sender: req.user._id,
        type: 'system',
        title: 'Invitation Response',
        message: `${req.user.name} has ${status} your invitation for team "${team.name}"`,
        link: `/student/dashboard`
    });

    const io = req.app.get('socketio');
    if (io) {
        io.to(team.leader.toString()).emit('notification', notification);
    }

    res.json(team);
});

// @desc    Lock/Unlock team
// @route   PUT /api/teams/:id/lock
// @access  Private (Team Lead)
const toggleLock = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (team.leader.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only team lead can lock the team');
    }

    team.isLocked = !team.isLocked;
    await team.save();

    res.json(team);
});

// @desc    Get my teams
// @route   GET /api/teams/my
// @access  Private
const getMyTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({
        'members.user': req.user._id
    })
        .populate('opportunity')
        .populate('leader', 'name email avatar')
        .populate('members.user', 'name email avatar studentProfile');

    res.json(teams);
});

// @desc    Update member role
// @route   PUT /api/teams/:id/role
// @access  Private (Team Lead)
const updateMemberRole = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (team.leader.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only team lead can update roles');
    }

    const memberIndex = team.members.findIndex(m => m.user.toString() === userId);
    if (memberIndex === -1) {
        res.status(404);
        throw new Error('Member not found');
    }

    team.members[memberIndex].role = role;
    await team.save();

    res.json(team);
});

const Task = require('../models/Task');
const TeamAsset = require('../models/TeamAsset');

// @desc    Get team tasks
// @route   GET /api/teams/:id/tasks
// @access  Private (Team Members)
const getTeamTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ team: req.params.id }).populate('assignee', 'name email avatar');
    res.json(tasks);
});

// @desc    Create team task
// @route   POST /api/teams/:id/tasks
// @access  Private (Team Members)
const createTeamTask = asyncHandler(async (req, res) => {
    const { title, description, priority, assignee, dueDate } = req.body;
    const task = await Task.create({
        team: req.params.id,
        title,
        description,
        priority,
        assignee,
        dueDate
    });

    const populatedTask = await Task.findById(task._id).populate('assignee', 'name email avatar');

    const io = req.app.get('socketio');
    if (io) {
        io.to(`project:${req.params.id}`).emit('task_created', populatedTask);
    }

    res.status(201).json(populatedTask);
});

// @desc    Update team task status/details
// @route   PUT /api/teams/tasks/:taskId
// @access  Private (Team Members)
const updateTeamTask = asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true }).populate('assignee', 'name email avatar');

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const io = req.app.get('socketio');
    if (io) {
        io.to(`project:${task.team}`).emit('task_updated', task);
    }

    res.json(task);
});

// @desc    Get team assets
// @route   GET /api/teams/:id/assets
// @access  Private (Team Members)
const getTeamAssets = asyncHandler(async (req, res) => {
    const assets = await TeamAsset.find({ team: req.params.id }).populate('uploadedBy', 'name');
    res.json(assets);
});

// @desc    Create team asset
// @route   POST /api/teams/:id/assets
// @access  Private (Team Members)
const createTeamAsset = asyncHandler(async (req, res) => {
    const { name, type, url } = req.body;
    const asset = await TeamAsset.create({
        team: req.params.id,
        name,
        type,
        url,
        uploadedBy: req.user._id
    });

    const populatedAsset = await TeamAsset.findById(asset._id).populate('uploadedBy', 'name');

    const io = req.app.get('socketio');
    if (io) {
        io.to(`project:${req.params.id}`).emit('asset_created', populatedAsset);
    }

    res.status(201).json(populatedAsset);
});

module.exports = {
    createTeam,
    inviteMember,
    respondToInvite,
    toggleLock,
    getMyTeams,
    updateMemberRole,
    getTeamTasks,
    createTeamTask,
    updateTeamTask,
    getTeamAssets,
    createTeamAsset
};
