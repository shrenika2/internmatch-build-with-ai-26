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
} = require('../controllers/companyController');
const {
    createCompanyPractice,
    getCompanyPracticeByOpp,
} = require('../controllers/practiceModuleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('company'));

router.get('/stats', getCompanyStats);
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.get('/applicants', getCompanyApplicants);
router.put('/applications/:id/status', updateApplicationStatus);
router.get('/opportunities', getCompanyOpportunities);
router.delete('/opportunities/:id', deleteOpportunity);
router.get('/opportunities/:id/shortlist', getShortlist);
router.post('/opportunities/:id/select', selectCandidate);

// Practice Modules
router.post('/practice', createCompanyPractice);
router.get('/practice/:opportunityId', getCompanyPracticeByOpp);

module.exports = router;
