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
// @route   PATCH /api/notifications/acknowledge-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
    try {
        console.log(`[DB] Executing batch acknowledgement for user: ${req.user._id}`);

        const result = await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );

        console.log(`[DB] Batch acknowledgement result - Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        if (result.matchedCount === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending signals detected in the logs.',
                modifiedCount: 0
            });
        }

        res.json({
            success: true,
            message: `${result.modifiedCount} signals acknowledged in batch.`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('[DB_ERROR] Batch notification update failure:', error);
        res.status(500);
        throw new Error(error.message || 'Batch notification update failed');
    }
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllRead
};
