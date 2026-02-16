const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const { logAction } = require('../utils/auditService');
const notificationService = require('../services/notificationService');
const analyticsService = require('../services/analyticsService');

// @desc    Get Detailed Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = asyncHandler(async (req, res) => {
    const analytics = await analyticsService.getDashboardOverview();
    res.json(analytics);
});

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
    const studentCount = await User.countDocuments({ role: 'student' });
    const companyCount = await User.countDocuments({ role: 'company' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const activeOpportunities = await Opportunity.countDocuments({ status: 'open' });
    const applicationCount = await Application.countDocuments();

    res.json({
        students: studentCount,
        companies: companyCount,
        faculty: facultyCount,
        activeOpportunities,
        totalApplications: applicationCount
    });
});

// @desc    Get All Users with Filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, status } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query).select('-password').sort('-createdAt');
    res.json(users);
});

// @desc    Get Pending User Approvals
// @route   GET /api/admin/pending-users
// @access  Private (Admin)
const getPendingUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ status: 'pending' })
        .select('-password')
        .sort('-createdAt');
    res.json(users);
});

// Helper for status updates
const updateUserStatus = async (userId, status, adminId, req) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const previousStatus = user.status;
    user.status = status;

    // Sync new boolean flags for modernization
    if (status === 'approved') {
        user.isVerified = true;
        user.isSuspended = false;
    } else if (status === 'blocked') {
        user.isSuspended = true;
    } else if (status === 'rejected') {
        user.isSuspended = true;
    }

    await user.save();

    logAction({
        userId: adminId,
        action: 'ADMIN_USER_STATUS_UPDATE',
        entityType: 'User',
        entityId: userId,
        metadata: { from: previousStatus, to: status },
        req
    });

    const io = req.app.get('socketio');

    await notificationService.sendNotification({
        userId,
        senderId: adminId,
        type: 'profile_update',
        title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your account status has been updated to: ${status}.`,
        link: '/login',
        priority: 'high'
    }, io);

    // 2. Emit Socket Event for special actions
    if (io) {
        io.emit('admin:status-update', { userId, status });
        if (status === 'blocked' || status === 'rejected') {
            io.to(userId.toString()).emit('force-logout', { message: `Your account has been ${status}.` });
        }
    }

    return user;
};

// @desc    Approve User
// @route   PUT /api/admin/approve/:userId
// @access  Private (Admin)
const approveUser = asyncHandler(async (req, res) => {
    await updateUserStatus(req.params.userId, 'approved', req.user._id, req);
    res.json({ success: true, message: 'User account has been successfully validated and approved.' });
});

// @desc    Reject User
// @route   PUT /api/admin/reject/:userId
// @access  Private (Admin)
const rejectUser = asyncHandler(async (req, res) => {
    await updateUserStatus(req.params.userId, 'rejected', req.user._id, req);
    res.json({ success: true, message: 'User registration request has been rejected.' });
});

// @desc    Block User
// @route   PUT /api/admin/block/:userId
// @access  Private (Admin)
const blockUser = asyncHandler(async (req, res) => {
    await updateUserStatus(req.params.userId, 'blocked', req.user._id, req);
    res.json({ success: true, message: 'User account has been suspended and access revoked.' });
});

// @desc    Unblock User
// @route   PUT /api/admin/unblock/:userId
// @access  Private (Admin)
const unblockUser = asyncHandler(async (req, res) => {
    await updateUserStatus(req.params.userId, 'approved', req.user._id, req);
    res.json({ success: true, message: 'User account suspension has been lifted.' });
});

// @desc    Delete User (Soft Delete or Permanent)
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin users');
    }

    logAction({
        userId: req.user._id,
        action: 'ADMIN_USER_DELETE',
        entityType: 'User',
        entityId: user._id,
        metadata: { deletedUserName: user.name, deletedUserEmail: user.email },
        req
    });

    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted permanently' });
});

// @desc    Get All Opportunities
// @route   GET /api/admin/opportunities
// @access  Private (Admin)
const getAllOpportunities = asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const opportunities = await Opportunity.find(query)
        .populate('postedBy', 'name email role status')
        .sort('-createdAt');
    res.json(opportunities);
});

// @desc    Moderate Opportunity (Approve/Reject/Disable)
// @route   PUT /api/admin/opportunities/:id/status
// @access  Private (Admin)
const updateOpportunityStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        res.status(404);
        throw new Error('Opportunity not found');
    }

    const previousStatus = opportunity.status;
    opportunity.status = status;
    await opportunity.save();

    logAction({
        userId: req.user._id,
        action: 'ADMIN_OPPORTUNITY_STATUS_UPDATE',
        entityType: 'Opportunity',
        entityId: opportunity._id,
        metadata: { from: previousStatus, to: status },
        req
    });

    const io = req.app.get('socketio');

    // Notify the poster
    await notificationService.sendNotification({
        userId: opportunity.postedBy,
        senderId: req.user._id,
        type: 'opportunity_update',
        title: 'Opportunity Status Updated',
        message: `Your opportunity "${opportunity.title}" status has been updated to ${status}.`,
        link: `/opportunities/${opportunity._id}`
    }, io);

    if (io) {
        // Broadcast to all if it becomes 'open' or 'closed'
        if (status === 'open' || status === 'closed') {
            io.emit('opportunity:statusUpdated', {
                opportunityId: opportunity._id,
                status,
                title: opportunity.title
            });
        }
    }

    res.json({ message: `Opportunity status updated to ${status}` });
});

// @desc    Broadcast System Message
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
const broadcastMessage = asyncHandler(async (req, res) => {
    const { title, message, targetGroup, link } = req.body;
    // targetGroup can be 'all', 'students', 'faculty', 'company' or specific filters like { branch: 'CS' }

    let query = {};
    if (targetGroup === 'students') query.role = 'student';
    else if (targetGroup === 'faculty') query.role = 'faculty';
    else if (targetGroup === 'company') query.role = 'company';
    else if (typeof targetGroup === 'object') query = { ...query, ...targetGroup };

    const users = await User.find(query).select('_id');
    const userIds = users.map(u => u._id);

    const io = req.app.get('socketio');

    await notificationService.broadcast({
        type: 'broadcast',
        title,
        message,
        link: link || '#',
        senderId: req.user._id,
        priority: 'medium'
    }, userIds, io);

    logAction({
        userId: req.user._id,
        action: 'ADMIN_BROADCAST',
        entityType: 'Multiple',
        metadata: { title, targetGroup, recipientCount: users.length },
        req
    });

    if (io) {
        // Additional socket events if needed
        if (targetGroup === 'all') {
            io.emit('broadcast:new', { title, message, link });
        }
    }

    res.json({ success: true, message: `Broadcast sent to ${users.length} users.` });
});

// @desc    Get All Applications (Audit Logs)
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAllApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find()
        .populate('student', 'name email')
        .populate({
            path: 'opportunity',
            populate: { path: 'postedBy', select: 'name role' }
        })
        .sort('-createdAt');
    res.json(applications);
});

// @desc    Get System Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { action, userId, entityType } = req.query;
    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (entityType) query.entityType = entityType;

    const logs = await AuditLog.find(query)
        .populate('userId', 'name email role')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
        logs,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

module.exports = {
    getStats,
    getAllUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    blockUser,
    unblockUser,
    deleteUser,
    getAllOpportunities,
    updateOpportunityStatus,
    getAllApplications,
    broadcastMessage,
    getAuditLogs,
    getAnalytics
};
