const express = require('express');
const router = express.Router();
const { getStudentHubs } = require('../controllers/communityController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @desc    Get hubs for student
 * @route   GET /api/hubs/student
 * @access  Private (Student)
 */
router.get('/student', protect, authorize('student'), getStudentHubs);

module.exports = router;
