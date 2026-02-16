const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile, getStudentProfileById } = require('../controllers/studentProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/me')
    .get(authorize('student'), getMyProfile)
    .post(authorize('student'), upsertProfile);

router.get('/:id', authorize('company', 'faculty', 'admin'), getStudentProfileById);

module.exports = router;
