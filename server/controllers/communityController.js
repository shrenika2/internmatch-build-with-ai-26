const asyncHandler = require('express-async-handler');
const Community = require('../models/Community');
const Message = require('../models/Message');
const MemberReadStatus = require('../models/MemberReadStatus');
const Team = require('../models/Team');

// @desc    Create new community
// @route   POST /api/communities
// @access  Private
const createCommunity = asyncHandler(async (req, res) => {
    const { name, type, relatedOpportunity, relatedTeam } = req.body;

    // Allow students to create a 'student-group', and faculty to create hubs for their teams
    if (type !== 'student-group' && req.user.role === 'student') {
        res.status(403);
        throw new Error('Students can only create group hubs.');
    }

    const members = [req.user._id];

    // If faculty is creating a hub for a team, auto-attach all team members
    if (relatedTeam) {
        const team = await Team.findById(relatedTeam);
        if (team) {
            team.members.forEach(member => {
                if (!members.includes(member.user)) {
                    members.push(member.user);
                }
            });
            // If the creator is faculty and not in team, they are already in members[0]
        }
    }

    const community = await Community.create({
        name,
        type,
        relatedOpportunity,
        relatedTeam,
        createdBy: req.user._id,
        members,
    });

    res.status(201).json(community);
});

/**
 * @desc    Get hubs for logged-in student
 * @route   GET /api/communities/student
 * @access  Private (Student)
 */
const getStudentHubs = asyncHandler(async (req, res) => {
    const communities = await Community.find({
        members: req.user._id
    }).populate('createdBy', 'name role')
        .populate('relatedOpportunity', 'title')
        .populate('relatedTeam', 'name');

    // Add unread counts (reusing logic from getMyCommunities)
    const hubsWithStats = await Promise.all(communities.map(async (comm) => {
        const readStatus = await MemberReadStatus.findOne({
            user: req.user._id,
            community: comm._id
        });

        const unreadCount = await Message.countDocuments({
            community: comm._id,
            isModerated: false,
            createdAt: { $gt: readStatus ? readStatus.lastReadAt : new Date(0) }
        });

        return {
            ...comm.toObject(),
            unreadCount
        };
    }));

    res.json(hubsWithStats);
});

// @desc    Get communities user belongs to with unread counts
// @route   GET /api/communities/my
// @access  Private
const getMyCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({
        members: req.user._id
    }).populate('createdBy', 'name role');

    // Calculate unread counts for each community
    const processedCommunities = await Promise.all(communities.map(async (comm) => {
        const readStatus = await MemberReadStatus.findOne({
            user: req.user._id,
            community: comm._id
        });

        const unreadCount = await Message.countDocuments({
            community: comm._id,
            isModerated: false,
            createdAt: { $gt: readStatus ? readStatus.lastReadAt : new Date(0) }
        });

        return {
            ...comm.toObject(),
            unreadCount
        };
    }));

    res.json(processedCommunities);
});

// @desc    Get all available communities (for discovery)
// @route   GET /api/communities
// @access  Private
const getAllCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({}).populate('createdBy', 'name role');
    res.json(communities);
});

// @desc    Join community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.id);

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    // Role rules enforcement
    if (community.type === 'student-student' && req.user.role !== 'student') {
        res.status(403);
        throw new Error('Only students can join this community');
    }

    if (community.type === 'student-company' && !['student', 'company'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Only students and companies can join this community');
    }

    if (community.type === 'student-faculty' && !['student', 'faculty'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Only students and faculty can join this community');
    }

    if (community.members.includes(req.user._id)) {
        res.status(400);
        throw new Error('Already a member');
    }

    community.members.push(req.user._id);
    await community.save();

    res.json({ message: 'Joined successfully' });
});

// @desc    Get messages for a community
// @route   GET /api/communities/:id/messages
// @access  Private (Members only)
const getMessages = asyncHandler(async (req, res) => {
    const community = await Community.findById(req.params.id);

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    if (!community.members.includes(req.user._id) && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not a member of this community');
    }

    const messages = await Message.find({
        community: req.params.id,
        isModerated: false
    })
        .populate('sender', 'name role avatar')
        .sort('createdAt');

    res.json(messages);
});

// @desc    Send message
// @route   POST /api/communities/:id/message
// @access  Private (Members only)
const sendMessage = asyncHandler(async (req, res) => {
    const { content, parentMessage } = req.body;
    const community = await Community.findById(req.params.id);

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    // Only members can post messages
    if (!community.members.includes(req.user._id)) {
        res.status(403);
        throw new Error('Must be a member to send messages');
    }

    const message = await Message.create({
        community: req.params.id,
        sender: req.user._id,
        content,
        parentMessage: parentMessage || null,
        readBy: [{ user: req.user._id }]
    });

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name role avatar')
        .populate('parentMessage', 'content sender');

    // Update lastReadAt for the sender
    await MemberReadStatus.findOneAndUpdate(
        { user: req.user._id, community: req.params.id },
        { lastReadAt: new Date() },
        { upsert: true }
    );

    // Emit real-time socket event
    const io = req.app.get('socketio');
    if (io) {
        io.to(req.params.id).emit('new_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
});

// @desc    Mark community messages as read
// @route   POST /api/communities/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    await MemberReadStatus.findOneAndUpdate(
        { user: req.user._id, community: req.params.id },
        { lastReadAt: new Date() },
        { upsert: true }
    );

    // Also update individually for read receipts if needed
    // But for performance we usually do this in chunks or on view
    res.json({ message: 'Marked as read' });
});

// @desc    Mark specific message as read (for read receipts)
// @route   POST /api/communities/messages/:messageId/read
// @access  Private
const markMessageAsRead = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    const isRead = message.readBy.some(r => r.user.toString() === req.user._id.toString());
    if (!isRead) {
        message.readBy.push({ user: req.user._id });
        await message.save();

        const io = req.app.get('socketio');
        if (io) {
            io.to(message.community.toString()).emit('message_read', {
                messageId: message._id,
                userId: req.user._id
            });
        }
    }

    res.json({ success: true });
});

const toggleHelpful = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    const index = message.helpfulBy.indexOf(req.user._id);
    if (index === -1) {
        message.helpfulBy.push(req.user._id);
    } else {
        message.helpfulBy.splice(index, 1);
    }

    await message.save();
    res.json(message);
});

const Report = require('../models/Report');

// @desc    Report a piece of content
// @route   POST /api/communities/report
// @access  Private
const reportContent = asyncHandler(async (req, res) => {
    const { targetType, targetId, reason } = req.body;

    const report = await Report.create({
        reporter: req.user._id,
        targetType,
        targetId,
        reason,
    });

    res.status(201).json(report);
});

module.exports = {
    createCommunity,
    getStudentHubs,
    getMyCommunities,
    getAllCommunities,
    joinCommunity,
    getMessages,
    sendMessage,
    markAsRead,
    markMessageAsRead,
    toggleHelpful,
    reportContent,
};
