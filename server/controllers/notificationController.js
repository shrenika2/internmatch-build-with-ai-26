const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user._id })
        .populate('sender', 'name role avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await Notification.countDocuments({ userId: req.user._id });

    res.json({
        notifications,
        page,
        pages: Math.ceil(total / limit),
        total,
        unreadCount: await Notification.countDocuments({ userId: req.user._id, read: false })
    });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, read: false },
        { $set: { read: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllRead
};
