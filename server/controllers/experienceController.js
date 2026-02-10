const asyncHandler = require('express-async-handler');
const StudentExperience = require('../models/StudentExperience');

// @desc    Submit new experience
// @route   POST /api/experience
// @access  Private (Student)
const submitExperience = asyncHandler(async (req, res) => {
    const {
        companyId,
        opportunityId,
        type,
        content,
        videoUrl,
        isAnonymous,
        difficulty,
        rating,
        rounds,
        tips
    } = req.body;

    const experience = await StudentExperience.create({
        studentId: req.user._id,
        companyId,
        opportunityId: opportunityId || null,
        type,
        content,
        videoUrl,
        isAnonymous,
        difficulty,
        rating,
        rounds,
        tips,
        status: 'pending'
    });

    res.status(201).json(experience);
});

// @desc    Get approved experiences for a company
// @route   GET /api/experience/company/:id
// @access  Private
const getCompanyExperiences = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const experiences = await StudentExperience.find({
        companyId: req.params.id,
        status: 'approved'
    })
        .populate('studentId', 'name studentProfile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await StudentExperience.countDocuments({
        companyId: req.params.id,
        status: 'approved'
    });

    // Handle anonymous entries
    const sanitizedExperiences = experiences.map(exp => {
        const doc = exp.toObject();
        if (doc.isAnonymous) {
            delete doc.studentId;
            doc.studentName = 'Anonymous Student';
        } else {
            doc.studentName = doc.studentId.name;
        }
        return doc;
    });

    res.json({
        experiences: sanitizedExperiences,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get student's own experiences
// @route   GET /api/experience/student/me
// @access  Private (Student)
const getMyExperiences = asyncHandler(async (req, res) => {
    const experiences = await StudentExperience.find({ studentId: req.user._id })
        .populate('companyId', 'name companyProfile.companyName');
    res.json(experiences);
});

// @desc    Approve/Reject experience
// @route   PATCH /api/experience/:id/approve
// @access  Private (Admin/Faculty)
const updateExperienceStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // approved | rejected

    if (!['approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const experience = await StudentExperience.findById(req.params.id);

    if (!experience) {
        res.status(404);
        throw new Error('Experience not found');
    }

    experience.status = status;
    await experience.save();

    res.json(experience);
});

// @desc    Get all pending experiences (Admin only)
// @route   GET /api/experience/pending
// @access  Private (Admin/Faculty)
const getPendingExperiences = asyncHandler(async (req, res) => {
    const experiences = await StudentExperience.find({ status: 'pending' })
        .populate('studentId', 'name studentProfile')
        .populate('companyId', 'name companyProfile.companyName');
    res.json(experiences);
});

module.exports = {
    submitExperience,
    getCompanyExperiences,
    getMyExperiences,
    updateExperienceStatus,
    getPendingExperiences
};
