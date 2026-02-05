const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // College email validation for students
    if (role === 'student' && !email.endsWith('.edu')) {
        res.status(400);
        throw new Error('Please use your college (.edu) email address');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Prevent anyone from registering as an admin
    const finalRole = role === 'admin' ? 'student' : (role || 'student');

    const user = await User.create({
        name,
        email,
        password,
        role: finalRole,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            token: generateToken(user._id),
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

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        // Enforce approved status for ALL roles (Enterprise Grade Security)
        if (user.status === 'pending') {
            res.status(401);
            throw new Error('Access Denied: Your account is currently pending administrative approval.');
        }

        if (user.status === 'rejected') {
            res.status(403);
            throw new Error('Access Denied: Your registration has been rejected. Please contact the portal administrator.');
        }

        if (user.status === 'blocked') {
            res.status(403);
            throw new Error('Access Denied: Your account has been suspended indefinitely.');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            token: generateToken(user._id),
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
    res.json({ status: req.user.status });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getStatus,
};
