const asyncHandler = require('express-async-handler');
const PracticeModule = require('../models/PracticeModule');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

// ==========================================
// COMPANY CONTROLLERS
// ==========================================

// @desc    Create practice material for company
// @route   POST /api/company/practice
const createCompanyPractice = asyncHandler(async (req, res) => {
    const { title, description, type, contentType, fileUrl, externalLink, opportunityId } = req.body;

    const practiceModule = await PracticeModule.create({
        title,
        description,
        type,
        contentType,
        fileUrl,
        externalLink,
        postedByRole: 'company',
        postedBy: req.user._id,
        company: req.user._id,
        opportunity: opportunityId || null,
        visibilityRules: { openToAll: !opportunityId }
    });

    res.status(201).json(practiceModule);
});

// @desc    Get practice materials for a specific opportunity
// @route   GET /api/company/practice/:opportunityId
const getCompanyPracticeByOpp = asyncHandler(async (req, res) => {
    const modules = await PracticeModule.find({
        company: req.user._id,
        opportunity: req.params.opportunityId
    }).sort('-createdAt');

    res.json(modules);
});

// ==========================================
// FACULTY CONTROLLERS
// ==========================================

// @desc    Create practice material for faculty
// @route   POST /api/faculty/practice
const createFacultyPractice = asyncHandler(async (req, res) => {
    const { title, description, type, contentType, fileUrl, externalLink, visibilityRules } = req.body;

    const practiceModule = await PracticeModule.create({
        title,
        description,
        type,
        contentType,
        fileUrl,
        externalLink,
        postedByRole: 'faculty',
        postedBy: req.user._id,
        faculty: req.user._id,
        visibilityRules: visibilityRules || { openToAll: true }
    });

    res.status(201).json(practiceModule);
});

// @desc    Get practice materials posted by faculty
// @route   GET /api/faculty/practice
const getFacultyPractice = asyncHandler(async (req, res) => {
    const modules = await PracticeModule.find({
        faculty: req.user._id
    }).sort('-createdAt');

    res.json(modules);
});

// ==========================================
// STUDENT CONTROLLERS
// ==========================================

// @desc    Get all practice materials for student overview
// @route   GET /api/student/practice
const getStudentPracticeOverview = asyncHandler(async (req, res) => {
    // 1. Get companies student has applied to
    const applications = await Application.find({ student: req.user._id }).populate('opportunity');
    const appliedCompanyIds = [...new Set(applications.map(app => app.opportunity.postedBy.toString()))];

    // 2. Get corporate modules from applied companies
    const corporate = await PracticeModule.find({
        company: { $in: appliedCompanyIds }
    }).populate('company', 'name companyProfile').sort('-createdAt');

    // 3. Get faculty modules based on visibility rules
    const studentBranch = req.user.studentProfile?.branch;
    const studentYear = req.user.studentProfile?.year;

    const academic = await PracticeModule.find({
        postedByRole: 'faculty',
        $or: [
            { 'visibilityRules.openToAll': true },
            { 'visibilityRules.department': studentBranch },
            { 'visibilityRules.batch': studentYear }
        ]
    }).populate('faculty', 'name facultyProfile').sort('-createdAt');

    // 4. Check for interactive assessments (PracticeQuestions)
    const PracticeQuestion = require('../models/PracticeQuestion');
    const assessmentStats = await PracticeQuestion.aggregate([
        { $match: { company: { $in: appliedCompanyIds } } },
        { $group: { _id: "$company", count: { $sum: 1 } } }
    ]);

    const assessmentMap = assessmentStats.reduce((acc, stat) => {
        acc[stat._id.toString()] = stat.count;
        return acc;
    }, {});

    const corporateWithStats = corporate.map(m => {
        const doc = m.toObject();
        doc.assessmentCount = assessmentMap[m.company._id.toString()] || 0;
        return doc;
    });

    res.json({ corporate: corporateWithStats, academic });
});

// @desc    Get practice materials for a specific company (for student)
// @route   GET /api/student/practice/company/:companyId
const getStudentPracticeByCompany = asyncHandler(async (req, res) => {
    const modules = await PracticeModule.find({
        company: req.params.companyId,
        $or: [
            { opportunity: null },
            { 'visibilityRules.openToAll': true }
        ]
    }).sort('-createdAt');

    res.json(modules);
});

// @desc    Get practice materials for a specific opportunity (for student)
// @route   GET /api/student/practice/opportunity/:opportunityId
const getStudentPracticeByOpp = asyncHandler(async (req, res) => {
    const modules = await PracticeModule.find({
        opportunity: req.params.opportunityId
    }).sort('-createdAt');

    res.json(modules);
});

module.exports = {
    createCompanyPractice,
    getCompanyPracticeByOpp,
    createFacultyPractice,
    getFacultyPractice,
    getStudentPracticeOverview,
    getStudentPracticeByCompany,
    getStudentPracticeByOpp
};
