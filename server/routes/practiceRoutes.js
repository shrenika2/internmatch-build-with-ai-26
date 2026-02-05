const express = require('express');
const router = express.Router();
const {
    getPracticeByCompany,
    postAttempt,
    getReadinessScore,
} = require('../controllers/practiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/company/:companyId', protect, getPracticeByCompany);
router.post('/attempt', protect, authorize('student'), postAttempt);
router.get('/readiness/:studentId', protect, getReadinessScore);

module.exports = router;
