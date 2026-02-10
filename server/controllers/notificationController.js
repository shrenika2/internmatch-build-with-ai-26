const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .populate('sender', 'name role')
        .sort('-createdAt')
        .limit(20);
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllRead
};
