const express = require('express');
const router = express.Router();
const { createTeam, getMyTeams } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('student'), createTeam)
    .get(protect, getMyTeams);

module.exports = router;
