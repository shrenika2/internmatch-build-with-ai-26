const express = require('express');
const router = express.Router();
const { createInterviewSession } = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/session', protect, authorize('student'), createInterviewSession);

module.exports = router;
