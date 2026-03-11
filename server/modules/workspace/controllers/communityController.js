const Community = require('../models/WorkspaceCommunity');
const JoinRequest = require('../models/JoinRequest');

// Create a new community
exports.createCommunity = async (req, res) => {
    try {
        const { name, creatorId } = req.body;

        if (!name || !creatorId) {
            return res.status(400).json({ message: 'Name and Creator ID are required' });
        }

        const newCommunity = new Community({
            name,
            creatorId,
            members: [creatorId] // Creator is automatically a member
        });

        await newCommunity.save();
        res.status(201).json(newCommunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all communities
exports.getCommunities = async (req, res) => {
    try {
        const communities = await Community.find().sort({ createdAt: -1 });
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Request to join a community
exports.requestJoin = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { requesterId } = req.body;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (community.members.includes(requesterId)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        const existingRequest = await JoinRequest.findOne({
            communityId,
            requesterId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        const request = new JoinRequest({
            communityId,
            requesterId,
            status: 'pending'
        });

        await request.save();
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pending requests for a community (Creator only)
exports.getRequests = async (req, res) => {
    try {
        const { communityId } = req.params;
        // Assuming creatorId is passed in query or body for verification as rudimentary auth
        // In a real app, this would come from req.user
        const { userId } = req.query;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (community.creatorId !== userId) {
            return res.status(403).json({ message: 'Only creator can view requests' });
        }

        const requests = await JoinRequest.find({ communityId, status: 'pending' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve/Reject request
exports.processRequest = async (req, res) => {
    try {
        const { communityId, requestId } = req.params;
        const { action, userId } = req.body; // action: 'approve' | 'reject'

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (community.creatorId !== userId) {
            return res.status(403).json({ message: 'Only creator can process requests' });
        }

        const request = await JoinRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (action === 'approve') {
            request.status = 'approved';
            community.members.push(request.requesterId);
            await community.save();
        } else if (action === 'reject') {
            request.status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Community
exports.deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // sending userId in body for auth check

        const community = await Community.findById(id);
        if (!community) return res.status(404).json({ message: "Not found" });

        if (community.creatorId !== userId) {
            return res.status(403).json({ message: "Only creator can delete this community" });
        }

        // Cascade delete: Channels & Messages
        const Channel = require('../models/Channel');
        const Message = require('../models/WorkspaceMessage');

        const channels = await Channel.find({ communityId: id });
        const channelIds = channels.map(c => c._id);

        if (channelIds.length > 0) {
            await Message.deleteMany({ channelId: { $in: channelIds } });
            await Channel.deleteMany({ communityId: id });
        }

        await Community.findByIdAndDelete(id);
        // Clean up requests
        await JoinRequest.deleteMany({ communityId: id });

        res.json({ message: "Community deleted" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};
