const express = require('express');
const router = express.Router();
const {
    getTeamsForEvaluation,
    submitEvaluation
} = require('../controllers/evaluationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/project/:projectId', authorize('faculty'), getTeamsForEvaluation);
router.post('/', authorize('faculty'), submitEvaluation);

module.exports = router;
