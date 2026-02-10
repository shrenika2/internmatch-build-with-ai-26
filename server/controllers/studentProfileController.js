const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const { validateStudentProfile } = require('../middleware/validationMiddleware');

// Helper to normalize URLs
const normalizeUrl = (url, platform) => {
    if (!url) return '';
    let clean = url.trim().replace(/\/$/, ""); // remove trailing slash

    // If it's just a username, prepend the platform URL
    if (!clean.startsWith('http')) {
        const platformMap = {
            leetcode: 'https://leetcode.com/',
            codeforces: 'https://codeforces.com/profile/',
            codechef: 'https://www.codechef.com/users/'
        };
        return platformMap[platform] ? `${platformMap[platform]}${clean}` : clean;
    }
    return clean;
};

// @desc    Get current student's profile
// @route   GET /api/student-profile/me
// @access  Private (Student)
const getMyProfile = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ user: req.user._id })
        .populate('user', 'name email avatar');

    if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
});

// @desc    Create or Update student profile
// @route   POST /api/student-profile/me
// @access  Private (Student)
const upsertProfile = asyncHandler(async (req, res) => {
    // 1. Data Normalization
    if (req.body.cpProfiles) {
        req.body.cpProfiles.leetcode = normalizeUrl(req.body.cpProfiles.leetcode, 'leetcode');
        req.body.cpProfiles.codeforces = normalizeUrl(req.body.cpProfiles.codeforces, 'codeforces');
        req.body.cpProfiles.codechef = normalizeUrl(req.body.cpProfiles.codechef, 'codechef');
    }

    // 2. Joi Validation
    const { error } = validateStudentProfile(req.body);
    if (error) {
        const messages = error.details.map(d => d.message);
        return res.status(400).json({ message: 'Validation Error', errors: messages });
    }

    const profileFields = {
        ...req.body,
        user: req.user._id,
    };

    // Remove immutable fields if any
    delete profileFields._id;
    delete profileFields.createdAt;
    delete profileFields.updatedAt;

    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (profile) {
        // Update
        profile = await StudentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: profileFields },
            { new: true, runValidators: true }
        );
    } else {
        // Create
        profile = await StudentProfile.create(profileFields);
    }

    const io = req.app.get('socketio');
    if (io) {
        io.emit('profile:updated', profile);
    }

    res.json(profile);
});

module.exports = {
    getMyProfile,
    upsertProfile
};
