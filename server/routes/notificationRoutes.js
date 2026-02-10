const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getNotifications);

router.put('/mark-all-read', protect, markAllRead);

router.route('/:id/read')
    .put(protect, markAsRead);

module.exports = router;
