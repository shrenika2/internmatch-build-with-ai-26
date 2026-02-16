const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const TeamActivity = require('../models/TeamActivity');
const TeamChatMessage = require('../models/TeamChatMessage');
const Task = require('../models/Task');
const TeamAsset = require('../models/TeamAsset');
const { logAction } = require('../utils/auditService');

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

    if (opportunity.type !== 'project') {
        res.status(400);
        throw new Error('Teams can only be formed for research projects');
    }

    const team = await Team.create({
        name,
        opportunity: opportunityId,
        leader: req.user._id,
        mentor: opportunity.postedBy,
        members: [{
            user: req.user._id,
            role: 'Lead',
            status: 'accepted'
        }]
    });

    logAction({
        userId: req.user._id,
        action: 'TEAM_CREATE',
        entityType: 'Team',
        entityId: team._id,
        metadata: { teamName: name, opportunityId },
        req
    });

    await TeamActivity.create({
        team: team._id,
        user: req.user._id,
        type: 'MEMBER_JOINED',
        description: `${req.user.name} established the team node.`
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

    const io = req.app.get('socketio');

    // Notify user
    await notificationService.sendNotification({
        userId: user._id,
        senderId: req.user._id,
        type: 'system',
        title: 'Team Invitation',
        message: `${req.user.name} invited you to join team "${team.name}"`,
        link: `/student/dashboard`
    }, io);

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

    const io = req.app.get('socketio');

    // Notify lead
    await notificationService.sendNotification({
        userId: team.leader,
        senderId: req.user._id,
        type: 'system',
        title: 'Invitation Response',
        message: `${req.user.name} has ${status} your invitation for team "${team.name}"`,
        link: `/student/dashboard`
    }, io);

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

    logAction({
        userId: req.user._id,
        action: 'TEAM_LOCK_TOGGLE',
        entityType: 'Team',
        entityId: team._id,
        metadata: { isLocked: team.isLocked },
        req
    });

    await TeamActivity.create({
        team: team._id,
        user: req.user._id,
        type: 'PROJECT_LOCKED',
        description: `Project synchronization ${team.isLocked ? 'locked' : 'unlocked'} by Lead.`,
        metadata: { isLocked: team.isLocked }
    });

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

// ==========================================
// CHAT & ACTIVITY ENGINE
// ==========================================

// @desc    Get team activity feed
// @route   GET /api/teams/:id/activity
// @access  Private (Team Members)
const getTeamActivity = asyncHandler(async (req, res) => {
    const activities = await TeamActivity.find({ team: req.params.id })
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .limit(50);
    res.json(activities);
});

// @desc    Get team chat messages
// @route   GET /api/teams/:id/chat
// @access  Private (Team Members)
const getTeamMessages = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await TeamChatMessage.find({ team: req.params.id })
        .populate('sender', 'name avatar role')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    res.json(messages.reverse());
});

// @desc    Send team chat message
// @route   POST /api/teams/:id/chat
// @access  Private (Team Members)
const sendTeamMessage = asyncHandler(async (req, res) => {
    const { text, attachments } = req.body;
    const message = await TeamChatMessage.create({
        team: req.params.id,
        sender: req.user._id,
        text,
        attachments
    });

    const populatedMessage = await TeamChatMessage.findById(message._id)
        .populate('sender', 'name avatar role');

    const io = req.app.get('socketio');
    if (io) {
        io.to(`project:${req.params.id}`).emit('team:message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
});

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

    await TeamActivity.create({
        team: req.params.id,
        user: req.user._id,
        type: 'TASK_CREATED',
        description: `New objective deployed: ${title}`,
        metadata: { taskId: task._id }
    });

    const io = req.app.get('socketio');
    if (io) {
        io.to(`project:${req.params.id}`).emit('task_created', populatedTask);
    }

    res.status(201).json(populatedTask);
});

const updateTeamTask = asyncHandler(async (req, res) => {
    const oldTask = await Task.findById(req.params.taskId);
    if (!oldTask) {
        res.status(404);
        throw new Error('Task not found');
    }

    const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true }).populate('assignee', 'name email avatar');

    // Track status change
    if (req.body.status && req.body.status !== oldTask.status) {
        task.statusHistory.push({
            status: req.body.status,
            updatedBy: req.user._id
        });
        await task.save();

        await TeamActivity.create({
            team: task.team,
            user: req.user._id,
            type: 'TASK_UPDATED',
            description: `Objective status updated to ${req.body.status}: ${task.title}`,
            metadata: { taskId: task._id, oldStatus: oldTask.status, newStatus: req.body.status }
        });
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

    await TeamActivity.create({
        team: req.params.id,
        user: req.user._id,
        type: 'ASSET_UPLOADED',
        description: `Shared resource uploaded: ${name}`,
        metadata: { assetId: asset._id }
    });

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
    createTeamAsset,
    getTeamActivity,
    getTeamMessages,
    sendTeamMessage
};
