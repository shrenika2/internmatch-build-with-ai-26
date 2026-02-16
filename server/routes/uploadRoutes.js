const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const fileService = require('../services/fileService');
const { protect } = require('../middleware/authMiddleware');
const { logAction } = require('../utils/auditService');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('image'), asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image');
    }

    const result = await fileService.uploadFromBuffer(req.file.buffer, {
        folder: 'pict_portal/avatars',
        transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' }
        ]
    });

    logAction({
        userId: req.user._id,
        action: 'AVATAR_UPLOAD',
        entityType: 'User',
        entityId: req.user._id,
        req
    });

    res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id
    });
}));

const User = require('../models/User');
const aiService = require('../services/aiService');

// @desc    Upload resume
// @route   POST /api/upload/resume
// @access  Private (Student)
router.post('/resume', protect, upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    const { mimetype, buffer, originalname } = req.file;

    // Support PDF and DOCX
    const isDocx = mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || originalname.endsWith('.docx');
    const isPdf = mimetype === 'application/pdf' || originalname.endsWith('.pdf');

    if (!isPdf && !isDocx) {
        res.status(400);
        throw new Error('Only PDF and DOCX resumes are allowed');
    }

    // 1. Upload to Cloudinary
    const result = await fileService.uploadFromBuffer(buffer, {
        folder: 'pict_portal/resumes',
        resource_type: mimetype === 'application/pdf' ? 'image' : 'raw' // Cloudinary handles PDFs as images sometimes but raw is safer for docs
    });

    // 2. Trigger IMMEDIATE parsing for architectural PERSISTENCE
    let extractionResult;
    if (isDocx) {
        extractionResult = await aiService.extractTextFromDOCX(buffer);
    } else {
        extractionResult = await aiService.extractTextFromPDF(buffer);
    }

    // Defensive Check: If extraction failed (image-based or corrupt), notify user IMMEDIATELY
    if (!extractionResult.success) {
        res.status(400);
        throw new Error(extractionResult.message);
    }

    const { skills } = await aiService.extractSkills(extractionResult);

    // 3. Update Student Profile Persistence
    const user = await User.findById(req.user._id);
    if (user && user.role === 'student') {
        user.studentProfile.resumeFileUrl = result.secure_url;
        user.studentProfile.parsedSkills = skills;
        user.studentProfile.resumeParsedAt = new Date();
        // Also update the existing resumeUrl if needed
        user.studentProfile.resumeUrl = result.secure_url;
        await user.save();
    }

    logAction({
        userId: req.user._id,
        action: 'RESUME_UPLOAD_AND_PARSE',
        entityType: 'User',
        entityId: req.user._id,
        metadata: { skillsExtracted: skills.length },
        req
    });

    res.json({
        success: true,
        url: result.secure_url,
        skills: skills,
        parsedAt: user.studentProfile.resumeParsedAt
    });
}));

// @desc    Upload video (for experiences)
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, upload.single('video'), asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a video');
    }

    const result = await fileService.uploadFromBuffer(req.file.buffer, {
        folder: 'pict_portal/videos',
        resource_type: 'video'
    });

    logAction({
        userId: req.user._id,
        action: 'VIDEO_UPLOAD',
        entityType: 'User',
        entityId: req.user._id,
        req
    });

    res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id
    });
}));

module.exports = router;
