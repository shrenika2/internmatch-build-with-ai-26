const express = require('express');
const router = express.Router();
const {
    createTeam,
    inviteMember,
    respondToInvite,
    toggleLock,
    getMyTeams,
    updateMemberRole,
    getTeamTasks,
    createTeamTask,
    updateTeamTask,
    getTeamAssets,
    createTeamAsset,
    getTeamActivity,
    getTeamMessages,
    sendTeamMessage
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('student'), createTeam);
router.get('/my', getMyTeams);
router.post('/:id/invite', authorize('student'), inviteMember);
router.put('/:id/respond', authorize('student'), respondToInvite);
router.put('/:id/lock', authorize('student'), toggleLock);
router.put('/:id/role', authorize('student'), updateMemberRole);

// Task & Asset Collaboration
router.get('/:id/tasks', getTeamTasks);
router.post('/:id/tasks', createTeamTask);
router.put('/tasks/:taskId', updateTeamTask);
router.get('/:id/assets', getTeamAssets);
router.post('/:id/assets', createTeamAsset);

// Chat & Activity Feed
router.get('/:id/activity', getTeamActivity);
router.get('/:id/chat', getTeamMessages);
router.post('/:id/chat', sendTeamMessage);

module.exports = router;
