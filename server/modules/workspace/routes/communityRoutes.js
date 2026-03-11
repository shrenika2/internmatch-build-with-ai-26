const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// Community CRUD
router.post('/', communityController.createCommunity);
router.get('/', communityController.getCommunities);
router.delete('/:id', communityController.deleteCommunity);

// Join Requests
router.post('/:communityId/request', communityController.requestJoin);
router.get('/:communityId/requests', communityController.getRequests);
router.put('/:communityId/request/:requestId', communityController.processRequest);

module.exports = router;
