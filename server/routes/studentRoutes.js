const express = require('express');
const router = express.Router();
const {
    getStudentPracticeOverview,
    getStudentPracticeByCompany,
    getStudentPracticeByOpp
} = require('../controllers/practiceModuleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('student'));

router.get('/practice', getStudentPracticeOverview);
router.get('/practice/company/:companyId', getStudentPracticeByCompany);
router.get('/practice/opportunity/:opportunityId', getStudentPracticeByOpp);

module.exports = router;
