const asyncHandler = require('express-async-handler');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const PracticeAttempt = require('../models/PracticeAttempt');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get company stats
// @route   GET /api/company/stats
// @access  Private (Company)
const getCompanyStats = asyncHandler(async (req, res) => {
    const opportunities = await Opportunity.find({ postedBy: req.user._id });
    const opportunityIds = opportunities.map(o => o._id);

    const activePostings = opportunities.filter(o => o.status === 'open').length;
    const totalApplicants = await Application.countDocuments({ opportunity: { $in: opportunityIds } });
    const shortlistedCount = await Application.countDocuments({
        opportunity: { $in: opportunityIds },
        status: { $in: ['shortlisted', 'accepted'] }
    });

    // Recent applications
    const recentApplications = await Application.find({ opportunity: { $in: opportunityIds } })
        .populate('student', 'name email')
        .populate('opportunity', 'title')
        .sort('-createdAt')
        .limit(5);

    res.json({
        activePostings,
        totalApplicants,
        shortlistedCount,
        recentApplications
    });
});

// @desc    Get company profile
// @route   GET /api/company/profile
// @access  Private (Company)
const getCompanyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
});

// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private (Company)
const updateCompanyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.companyProfile = {
            ...user.companyProfile,
            ...req.body.companyProfile
        };

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            companyProfile: updatedUser.companyProfile
        });
    } else {
        res.status(404);
        throw new Error('Company not found');
    }
});

// @desc    Get all applicants for company's opportunities
// @route   GET /api/company/applicants
// @access  Private (Company)
const getCompanyApplicants = asyncHandler(async (req, res) => {
    const opportunities = await Opportunity.find({ postedBy: req.user._id });
    const opportunityIds = opportunities.map(o => o._id);

    const applications = await Application.find({ opportunity: { $in: opportunityIds } })
        .populate('student', 'name email studentProfile')
        .populate('opportunity', 'title type')
        .sort('-createdAt');

    res.json(applications);
});

// @desc    Update application status
// @route   PUT /api/company/applications/:id/status
// @access  Private (Company)
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
        .populate('opportunity')
        .populate('student');

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    // Verify ownership
    if (application.opportunity.postedBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this application');
    }

    application.status = status;
    await application.save();

    // Notify student
    const notification = await Notification.create({
        recipient: application.student._id,
        sender: req.user._id,
        type: 'application',
        title: `Application Status Updated`,
        message: `Your application for "${application.opportunity.title}" has been ${status}.`,
        link: '/student/dashboard'
    });

    const io = req.app.get('socketio');
    if (io) {
        io.to(application.student._id.toString()).emit('notification:new', notification);
    }

    res.json({ message: `Status updated to ${status}`, application });
});

// @desc    Delete company opportunity
// @route   DELETE /api/company/opportunities/:id
// @access  Private (Company)
const deleteOpportunity = asyncHandler(async (req, res) => {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        res.status(404);
        throw new Error('Opportunity not found');
    }

    // Verify ownership
    if (opportunity.postedBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this opportunity');
    }

    await Opportunity.findByIdAndDelete(req.params.id);
    // Also delete associated applications
    await Application.deleteMany({ opportunity: req.params.id });

    res.json({ message: 'Opportunity and associated applications removed' });
});

// @desc    Get AI-assisted shortlisting for an opportunity
// @route   GET /api/company/opportunities/:id/shortlist
// @access  Private (Company/Admin)
const getShortlist = asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings();

    if (!settings.enableAIShortlisting && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('AI-Assisted Shortlisting is currently disabled by administrators.');
    }

    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        res.status(404);
        throw new Error('Opportunity not found');
    }

    // Ensure only the poster can shortlist
    if (opportunity.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this shortlist');
    }

    const applications = await Application.find({ opportunity: req.params.id })
        .populate('student', 'name email studentProfile');

    const shortlistedCandidates = await Promise.all(
        applications.map(async (app) => {
            const student = app.student;

            // 1. Eligibility Check (Filter logic)
            let isEligible = true;
            let eligibilityReason = 'Meets criteria';

            if (opportunity.eligibilityCriteria) {
                const criteria = opportunity.eligibilityCriteria;
                const profile = student.studentProfile;

                if (criteria.minYear && profile.year < criteria.minYear) {
                    isEligible = false;
                    eligibilityReason = `Year ${profile.year} < ${criteria.minYear}`;
                } else if (criteria.branches && criteria.branches.length > 0 && !criteria.branches.includes(profile.branch)) {
                    isEligible = false;
                    eligibilityReason = `Branch ${profile.branch} not in ${criteria.branches.join(', ')}`;
                }
            }

            if (!isEligible) return null;

            // 2. Skill Match Score (40%)
            const requiredSkills = opportunity.requiredSkills || [];
            const studentSkills = student.studentProfile?.skills || [];
            const matchedSkills = requiredSkills.filter(skill => studentSkills.includes(skill));
            const skillMatchScore = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 100 : 100;

            // 3. Practice Activity Score (30%)
            // Count attempts in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const attempts = await PracticeAttempt.find({
                student: student._id,
                createdAt: { $gte: thirtyDaysAgo }
            });

            const correctAttempts = attempts.filter(a => a.isCorrect).length;
            const practiceScore = Math.min((correctAttempts / 10) * 100, 100); // 10 correct attempts for full points

            // 4. Readiness Score placeholder/logic (30%)
            // Using accuracy as the readiness component here for simplicity
            const totalAttempts = await PracticeAttempt.countDocuments({ student: student._id });
            const totalCorrect = await PracticeAttempt.countDocuments({ student: student._id, isCorrect: true });
            const readinessScore = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

            // Final Rank Score
            const rankScore = Math.round(
                (skillMatchScore * 0.4) +
                (practiceScore * 0.3) +
                (readinessScore * 0.3)
            );

            return {
                applicationId: app._id,
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    profile: student.studentProfile
                },
                scores: {
                    rankScore,
                    skillMatchScore: Math.round(skillMatchScore),
                    practiceScore: Math.round(practiceScore),
                    readinessScore: Math.round(readinessScore)
                },
                matchedSkills,
                status: app.status
            };
        })
    );

    // Filter out nulls and sort by rankScore
    const filteredShortlist = shortlistedCandidates
        .filter(c => c !== null)
        .sort((a, b) => b.scores.rankScore - a.scores.rankScore);

    res.json(filteredShortlist);
});

// @desc    Select a candidate for further rounds
// @route   POST /api/company/opportunities/:id/select
// @access  Private (Company/Admin)
const selectCandidate = asyncHandler(async (req, res) => {
    const { applicationId, status } = req.body; // status: 'shortlisted', 'accepted', 'rejected'

    const application = await Application.findById(applicationId).populate('opportunity').populate('student');

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    application.status = status;
    await application.save();

    // Create notification for student
    const notification = await Notification.create({
        recipient: application.student._id,
        sender: req.user._id,
        type: 'application',
        title: `Application Update: ${application.opportunity.title}`,
        message: `Your application for "${application.opportunity.title}" has been ${status}.`,
        link: '/student/dashboard',
    });

    // Real-time notification
    const io = req.app.get('socketio');
    if (io) {
        io.to(application.student._id.toString()).emit('notification:new', notification);
    }

    res.json({ message: `Candidate status updated to ${status}`, application });
});

// @desc    Get company posted opportunities
// @route   GET /api/company/opportunities
// @access  Private (Company)
const getCompanyOpportunities = asyncHandler(async (req, res) => {
    const opportunities = await Opportunity.find({ postedBy: req.user._id })
        .sort('-createdAt');
    res.json(opportunities);
});

// @desc    Get all public approved companies
// @route   GET /api/company/all
// @access  Private
const getPublicCompanies = asyncHandler(async (req, res) => {
    const companies = await User.find({ role: 'company', status: 'approved' })
        .select('name companyProfile avatar');
    res.json(companies);
});

module.exports = {
    getCompanyStats,
    getCompanyProfile,
    updateCompanyProfile,
    getCompanyApplicants,
    updateApplicationStatus,
    deleteOpportunity,
    getShortlist,
    selectCandidate,
    getCompanyOpportunities,
    getPublicCompanies
};
