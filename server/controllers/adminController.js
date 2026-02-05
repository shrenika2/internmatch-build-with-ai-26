const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

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

    user.status = status;
    await user.save();

    // 1. Create Notification
    await Notification.create({
        recipient: userId,
        sender: adminId,
        type: 'system',
        title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your account status has been updated to: ${status}.`,
        link: '/login'
    });

    // 2. Emit Socket Event
    const io = req.app.get('socketio');
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

    opportunity.status = status;
    await opportunity.save();

    res.json({ message: `Opportunity status updated to ${status}` });
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
    getAllApplications
};
