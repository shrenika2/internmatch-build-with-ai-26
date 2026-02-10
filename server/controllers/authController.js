const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const settingsService = require('../utils/settingsService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const settings = await settingsService.getSettings();

    // 1. Domain Validation
    if (role === 'student' && !email.endsWith('.edu')) {
        res.status(400);
        throw new Error('Please use your college (.edu) email address');
    }

    if (role === 'company' && settings.allowedCompanyEmailDomains.length > 0) {
        const domain = email.split('@')[1];
        if (!settings.allowedCompanyEmailDomains.includes(domain)) {
            res.status(400);
            throw new Error(`Registration restricted to specific company domains: ${settings.allowedCompanyEmailDomains.join(', ')}`);
        }
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // 2. Role Security
    const finalRole = role === 'admin' ? 'student' : (role || 'student');

    // 3. Status & Auto-approval Logic
    let status = 'pending';
    let isVerified = false;

    if (finalRole === 'student' && settings.enableStudentAutoApproval) {
        status = 'approved';
        isVerified = true;
    } else if (finalRole === 'company' && settings.enableCompanyAutoApproval) {
        status = 'approved';
        isVerified = true;
    } else if (finalRole === 'faculty') {
        // Faculty usually always requires manual verification unless specified otherwise
        status = 'pending';
    }

    const user = await User.create({
        name,
        email,
        password,
        role: finalRole,
        status,
        isVerified
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified,
            isSuspended: user.isSuspended,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const settings = await settingsService.getSettings();

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        // Enterprise Grade Security: Block if suspended
        if (user.isSuspended || user.status === 'blocked') {
            res.status(403);
            throw new Error('Access Denied: Your account has been suspended indefinitely.');
        }

        // Enrollment rules
        const isStudent = user.role === 'student';
        const isAutoApproved = (isStudent && settings.enableStudentAutoApproval) ||
            (user.role === 'company' && settings.enableCompanyAutoApproval);

        if (!isAutoApproved && user.status === 'pending') {
            res.status(401);
            throw new Error('Access Denied: Your account is currently pending administrative approval.');
        }

        if (user.status === 'rejected') {
            res.status(403);
            throw new Error('Access Denied: Your registration has been rejected.');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified || user.status === 'approved',
            isSuspended: user.isSuspended,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified || user.status === 'approved',
            isSuspended: user.isSuspended,
            studentProfile: user.studentProfile,
            companyProfile: user.companyProfile,
            facultyProfile: user.facultyProfile,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get account status
// @route   GET /api/auth/status
// @access  Private (Token Only)
const getStatus = asyncHandler(async (req, res) => {
    res.json({
        status: req.user.status,
        isVerified: req.user.isVerified || req.user.status === 'approved',
        isSuspended: req.user.isSuspended
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getStatus,
};
