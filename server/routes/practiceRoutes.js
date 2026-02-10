const express = require('express');
const router = express.Router();
const {
    getPracticeByCompany,
    postAttempt,
    getReadinessScore,
} = require('../controllers/practiceController');
const {
    uploadMaterial,
    getStudentMaterials,
    getCompanyMaterials,
    getFacultyMaterials,
    deleteMaterial
} = require('../controllers/practiceMaterialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Existing routes
router.get('/company/:companyId', protect, getPracticeByCompany);
router.post('/attempt', protect, authorize('student'), postAttempt);
router.get('/readiness/:studentId', protect, getReadinessScore);

// New practice material routes
router.post('/upload', protect, authorize('company', 'faculty'), upload.single('file'), uploadMaterial);
router.get('/student', protect, authorize('student'), getStudentMaterials);
router.get('/company-specific/:id', protect, getCompanyMaterials);
router.get('/faculty-specific/:id', protect, getFacultyMaterials);
router.delete('/material/:id', protect, authorize('company', 'faculty'), deleteMaterial);

module.exports = router;
