const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Company/Faculty/Admin)
const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, category, link } = req.body;

    const announcement = await Announcement.create({
        title,
        content,
        category,
        link,
        postedBy: req.user._id,
        role: req.user.role,
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate('postedBy', 'name role');

    const io = req.app.get('socketio');
    if (io) {
        io.emit('new_announcement', populatedAnnouncement);
    }

    res.status(201).json(announcement);
});

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find()
        .populate('postedBy', 'name role')
        .sort('-createdAt');
    res.json(announcements);
});

module.exports = {
    createAnnouncement,
    getAnnouncements,
};
