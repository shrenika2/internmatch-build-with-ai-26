const express = require('express');
const router = express.Router();
const {
    createCommunity,
    getMyCommunities,
    getAllCommunities,
    joinCommunity,
    getMessages,
    sendMessage,
    markAsRead,
    toggleHelpful,
    reportContent,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/report', protect, reportContent);

// Route management
router.route('/')
    .get(protect, getAllCommunities)
    .post(protect, createCommunity);

router.get('/my', protect, getMyCommunities);

router.post('/:id/join', protect, joinCommunity);

router.post('/:id/message', protect, sendMessage);
router.post('/:id/read', protect, markAsRead);
router.get('/:id/messages', protect, getMessages);
router.post('/messages/:messageId/helpful', protect, toggleHelpful);

module.exports = router;
