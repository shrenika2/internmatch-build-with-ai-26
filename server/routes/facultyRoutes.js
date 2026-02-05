const express = require('express');
const router = express.Router();
const {
    getFacultyProjects,
    handleTeamRequest,
    getProjectMessages,
    postProjectMessage
} = require('../controllers/facultyController');
const {
    createFacultyPractice,
    getFacultyPractice,
} = require('../controllers/practiceModuleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/projects', protect, authorize('faculty'), getFacultyProjects);
router.put('/teams/:teamId', protect, authorize('faculty'), handleTeamRequest);

router.route('/projects/:projectId/messages')
    .get(protect, getProjectMessages)
    .post(protect, postProjectMessage);

// Practice Modules
router.post('/practice', protect, authorize('faculty'), createFacultyPractice);
router.get('/practice', protect, authorize('faculty'), getFacultyPractice);

module.exports = router;
