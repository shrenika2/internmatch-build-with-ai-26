const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMockQuestions } = require('../controllers/aiController');

// All AI Mock Interview routes require authentication
router.use(protect);

router.post('/generate-questions', getMockQuestions);

module.exports = router;
