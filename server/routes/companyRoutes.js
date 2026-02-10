const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/companyController');
const {
    createCompanyPractice,
    getCompanyPracticeByOpp,
} = require('../controllers/practiceModuleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Publicly accessible for authenticated users (Students/Faculty/Admin)
router.get('/all', getPublicCompanies);

// Company only routes
router.get('/stats', authorize('company'), getCompanyStats);
router.get('/profile', authorize('company'), getCompanyProfile);
router.put('/profile', authorize('company'), updateCompanyProfile);
router.get('/applicants', authorize('company'), getCompanyApplicants);
router.put('/applications/:id/status', authorize('company'), updateApplicationStatus);
router.get('/opportunities', authorize('company'), getCompanyOpportunities);
router.delete('/opportunities/:id', authorize('company'), deleteOpportunity);
router.get('/opportunities/:id/shortlist', authorize('company', 'admin'), getShortlist);
router.post('/opportunities/:id/select', authorize('company', 'admin'), selectCandidate);

// Practice Modules
router.post('/practice', authorize('company'), createCompanyPractice);
router.get('/practice/:opportunityId', authorize('company'), getCompanyPracticeByOpp);

module.exports = router;
