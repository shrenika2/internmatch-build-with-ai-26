const express = require('express');
const router = express.Router();

const workspaceController = require('../controllers/workspaceController');
const channelController = require('../controllers/channelController');
const messageController = require('../controllers/messageController');
const groupController = require('../controllers/groupController');

// Workspace
router.get('/my', workspaceController.getMyWorkspace);
// No /create here as user asked for /my to auto-create, but if explicit create is needed:
// router.post('/create', workspaceController.createWorkspace); 

// Channels
router.get('/channels/:workspaceId', channelController.getChannels);
router.post('/channels/:workspaceId', channelController.createChannel); // URL param based on requirement or body? User req: POST /channels/:workspaceId

// Messages
router.get('/messages/:channelId', messageController.getMessages);
router.post('/messages/:channelId', messageController.sendMessage); // User req: POST /messages/:channelId

// Groups
router.post('/groups', groupController.createGroup);

module.exports = router;
