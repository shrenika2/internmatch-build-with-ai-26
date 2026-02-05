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
    getAllApplications
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes protected and restricted to Admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/pending-users', getPendingUsers);
router.put('/approve/:userId', approveUser);
router.put('/reject/:userId', rejectUser);
router.put('/block/:userId', blockUser);
router.put('/unblock/:userId', unblockUser);
router.delete('/users/:userId', deleteUser);

router.get('/opportunities', getAllOpportunities);
router.put('/opportunities/:id/status', updateOpportunityStatus);

router.get('/applications', getAllApplications);

module.exports = router;
