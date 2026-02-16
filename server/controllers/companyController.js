const asyncHandler = require('express-async-handler');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const PracticeAttempt = require('../models/PracticeAttempt');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const aiService = require('../services/aiService');
const settingsService = require('../utils/settingsService');

// @desc    Get counts for dashboard
// @route   GET /api/company/stats
// @access  Private (Company)
const getCompanyStats = asyncHandler(async (req, res) => {
    const opportunities = await Opportunity.find({ postedBy: req.user._id });
    const oppIds = opportunities.map(o => o._id);

    const activeOpportunities = opportunities.filter(o => o.status === 'open').length;
    const totalApplications = await Application.countDocuments({ opportunity: { $in: oppIds } });
    const pendingApplications = await Application.countDocuments({
        opportunity: { $in: oppIds },
        status: 'applied'
    });

    res.json({
        activeOpportunities,
        totalApplications,
        pendingApplications
    });
});

// @desc    Get company profile
// @route   GET /api/company/profile
// @access  Private (Company)
const getCompanyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('companyProfile name email avatar');
    res.json(user);
});

// @desc    Update company profile
// @route   POST /api/company/profile
// @access  Private (Company)
const updateCompanyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.companyProfile = { ...user.companyProfile, ...req.body };
    await user.save();
    res.json(user.companyProfile);
});

// @desc    Get all applicants for company opportunities
// @route   GET /api/company/applications
// @access  Private (Company)
const getCompanyApplicants = asyncHandler(async (req, res) => {
    const opportunities = await Opportunity.find({ postedBy: req.user._id });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({ opportunity: { $in: oppIds } })
        .populate('opportunity', 'title type requiredSkills')
        .populate('student', 'name email studentProfile avatar')
        .sort('-skillMatchScore -createdAt');

    // Trigger score RECOVERY for those missing it (async background protocol)
    applications.forEach(app => {
        const hasNoScore = !app.skillMatchScore || app.skillMatchScore === 0;
        const hasNoSkills = !app.resumeSkills || app.resumeSkills.length === 0;

        if (hasNoScore && hasNoSkills) {
            console.log(`[CORE_AUDIT] Recovery initiated for app ${app._id}`);
            aiService.extractTextFromURL(app.resume)
                .then(text => aiService.extractSkills(text))
                .then(data => {
                    const score = aiService.calculateMatchScore(data.skills, app.opportunity?.requiredSkills || []);
                    app.resumeSkills = data.skills;
                    app.skillMatchScore = score;
                    return app.save();
                })
                .then(() => console.log(`[CORE_AUDIT] Recovery SUCCESS for app ${app._id}`))
                .catch(err => console.error(`[CORE_AUDIT] Recovery FAILED for ${app._id}:`, err.message));
        }
    });

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

    const io = req.app.get('socketio');

    // Notify student
    await notificationService.sendNotification({
        userId: application.student._id,
        senderId: req.user._id,
        type: 'application',
        title: `Application Status Updated`,
        message: `Your application for "${application.opportunity.title}" has been ${status}.`,
        link: '/student/dashboard'
    }, io);

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

            // 2. AI Resume Skill Match Score (Priority)
            let resumeMatchScore = app.skillMatchScore;

            if (!resumeMatchScore || resumeMatchScore === 0) {
                try {
                    // Phase 3.2: If score missing → compute once and store
                    const resumeText = await aiService.extractTextFromURL(app.resume);
                    const aiData = await aiService.extractSkills(resumeText);
                    resumeMatchScore = aiService.calculateMatchScore(aiData.skills, opportunity.requiredSkills || []);

                    // Cache results
                    app.resumeSkills = aiData.skills;
                    app.skillMatchScore = resumeMatchScore;
                    await app.save();
                } catch (err) {
                    console.error(`[AI_MATCH] Failed to compute score for ${app._id}:`, err.message);
                    resumeMatchScore = 0;
                }
            }

            // 3. Practice Activity Score (30%)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const attempts = await PracticeAttempt.find({
                student: student._id,
                createdAt: { $gte: thirtyDaysAgo }
            });

            const correctAttempts = attempts.filter(a => a.isCorrect).length;
            const practiceScore = Math.min((correctAttempts / 10) * 100, 100);

            // 4. Readiness Score placeholder/logic (30%)
            const totalAttempts = await PracticeAttempt.countDocuments({ student: student._id });
            const totalCorrect = await PracticeAttempt.countDocuments({ student: student._id, isCorrect: true });
            const readinessScore = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

            // Final Rank Score (Unified)
            const rankScore = Math.round(
                (resumeMatchScore * 0.4) +
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
                    skillMatchScore: Math.round(resumeMatchScore),
                    practiceScore: Math.round(practiceScore),
                    readinessScore: Math.round(readinessScore)
                },
                matchedSkills: app.resumeSkills || [],
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

    // Notify student via service
    const io = req.app.get('socketio');
    await notificationService.sendNotification({
        userId: application.student._id,
        senderId: req.user._id,
        type: 'application',
        title: `Application Update: ${application.opportunity.title}`,
        message: `Your application for "${application.opportunity.title}" has been ${status}.`,
        link: '/student/dashboard'
    }, io);

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
