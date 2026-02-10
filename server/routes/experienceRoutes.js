const express = require('express');
const router = express.Router();
const {
    submitExperience,
    getCompanyExperiences,
    getMyExperiences,
    updateExperienceStatus,
    getPendingExperiences
} = require('../controllers/experienceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), submitExperience);
router.get('/pending', protect, authorize('admin', 'faculty'), getPendingExperiences);
router.get('/company/:id', protect, getCompanyExperiences);
router.get('/student/me', protect, authorize('student'), getMyExperiences);
router.patch('/:id/approve', protect, authorize('admin', 'faculty'), updateExperienceStatus);

module.exports = router;
