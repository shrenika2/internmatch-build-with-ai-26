const express = require('express');
const router = express.Router();
const {
    createOpportunity,
    getOpportunities,
    getOpportunityById,
    applyForOpportunity,
    getMyApplications,
} = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/authMiddleware');
const resumeUpload = require('../middleware/resumeUpload');
const { getOpportunityMessages, postOpportunityMessage } = require('../controllers/chatController');

router.get('/my-applications', protect, authorize('student'), getMyApplications);

router.route('/:id/messages')
    .get(protect, getOpportunityMessages)
    .post(protect, postOpportunityMessage);

router.route('/')
    .get(getOpportunities)
    .post(protect, authorize('company', 'faculty', 'admin'), createOpportunity);

router.route('/:id')
    .get(getOpportunityById);

router.post('/:id/apply', protect, authorize('student'), applyForOpportunity);


module.exports = router;
