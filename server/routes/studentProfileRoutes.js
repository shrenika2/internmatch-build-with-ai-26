const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile } = require('../controllers/studentProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('student'));

router.route('/me')
    .get(getMyProfile)
    .post(upsertProfile);

module.exports = router;
