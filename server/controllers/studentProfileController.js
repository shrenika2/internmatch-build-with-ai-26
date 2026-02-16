const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { validateStudentProfile } = require('../middleware/validationMiddleware');
const { logAction } = require('../utils/auditService');

// Helper to normalize URLs
const normalizeUrl = (url, platform) => {
    if (!url) return '';
    let clean = url.trim().replace(/\/$/, "");

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

// @desc    Get current student's profile (Consolidated)
// @route   GET /api/student-profile/me
// @access  Private (Student)
const getMyProfile = asyncHandler(async (req, res) => {
    // With unified model, profile is already on req.user if protect middleware is used
    // But we might want to ensure we have the latest or full data
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'student') {
        return res.status(404).json({ message: 'Student profile not found' });
    }

    // Return in a format compatible with existing frontend expectations
    // Frontend expects an object with .user (populated) and profile fields
    const response = {
        ...user.studentProfile.toObject(),
        fullName: user.name,
        location: user.location,
        bio: user.bio,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            location: user.location
        }
    };

    res.json(response);
});

// @desc    Create or Update student profile (Unified)
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

    const profileData = { ...req.body };
    const fullName = profileData.fullName;
    const location = profileData.location;

    // Clean up fields that shouldn't be in the subdocument
    delete profileData.user;
    delete profileData.fullName;
    delete profileData._id;
    delete profileData.location;
    delete profileData.email; // Email should not be updated via profile form for security

    // 3. Update User Model
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (fullName) user.name = fullName;
    if (location) user.location = location;
    if (profileData.bio) user.bio = profileData.bio;

    // Merge profile data securely
    Object.keys(profileData).forEach(key => {
        // Handle nested objects like cpProfiles and links
        if (typeof profileData[key] === 'object' && !Array.isArray(profileData[key]) && profileData[key] !== null) {
            user.studentProfile[key] = { ...user.studentProfile[key], ...profileData[key] };
        } else {
            user.studentProfile[key] = profileData[key];
        }
    });

    await user.save();

    logAction({
        userId: user._id,
        action: 'PROFILE_UPDATE',
        entityType: 'User',
        entityId: user._id,
        req
    });

    const io = req.app.get('socketio');
    if (io) {
        io.emit('profile:updated', { userId: user._id, profile: user.studentProfile });
    }

    // Return compatible format
    const response = {
        ...user.studentProfile.toObject(),
        fullName: user.name,
        location: user.location,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            location: user.location
        }
    };

    res.json(response);
});

// @desc    Get student profile by ID
// @route   GET /api/student-profile/:id
// @access  Private (Company/Faculty/Admin)
const getStudentProfileById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'student') {
        res.status(404);
        throw new Error('Student profile not found');
    }

    const response = {
        ...user.studentProfile.toObject(),
        fullName: user.name,
        location: user.location,
        bio: user.bio,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            location: user.location
        }
    };

    res.json(response);
});

module.exports = {
    getMyProfile,
    upsertProfile,
    getStudentProfileById
};
