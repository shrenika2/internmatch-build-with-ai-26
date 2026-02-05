const express = require('express');
const router = express.Router();
const { createResource, getResources } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getResources)
    .post(protect, authorize('company', 'faculty', 'admin'), createResource);

module.exports = router;
