const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    blockUser,
    unblockUser,
    deleteUser,
    getAllOpportunities,
    updateOpportunityStatus,
    getAllApplications,
    broadcastMessage,
    getAuditLogs,
    getAnalytics
} = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { getSystemHealth } = require('../controllers/systemHealthController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dashboard & Metrics
router.get('/stats', protect, admin, getStats);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/system-health', protect, admin, getSystemHealth);

// User Management
router.get('/users', protect, admin, getAllUsers);
router.get('/pending-users', protect, admin, getPendingUsers);
router.put('/approve/:userId', protect, admin, approveUser);
router.put('/reject/:userId', protect, admin, rejectUser);
router.put('/block/:userId', protect, admin, blockUser);
router.put('/unblock/:userId', protect, admin, unblockUser);
router.delete('/users/:userId', protect, admin, deleteUser);

// Content Moderation
router.get('/opportunities', protect, admin, getAllOpportunities);
router.put('/opportunities/:id/status', protect, admin, updateOpportunityStatus);
router.get('/applications', protect, admin, getAllApplications);

// Communications
router.post('/broadcast', protect, admin, broadcastMessage);

// Governance
router.get('/audit-logs', protect, admin, getAuditLogs);

// Platform Settings
router.route('/settings')
    .get(protect, admin, getSettings)
    .put(protect, admin, updateSettings);

module.exports = router;
