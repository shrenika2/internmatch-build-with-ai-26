const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAnnouncements)
    .post(protect, authorize('company', 'faculty', 'admin'), createAnnouncement);

module.exports = router;
