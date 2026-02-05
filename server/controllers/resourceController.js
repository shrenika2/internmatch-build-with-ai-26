const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');

// @desc    Create new practice material/resource
// @route   POST /api/resources
// @access  Private (Company/Faculty/Admin)
const createResource = asyncHandler(async (req, res) => {
    const { title, description, type, url, category, relatedOpportunity } = req.body;

    const Opportunity = require('../models/Opportunity');

    if (relatedOpportunity) {
        const opportunity = await Opportunity.findById(relatedOpportunity);
        if (!opportunity) {
            res.status(404);
            throw new Error('Related opportunity not found');
        }

        // Check ownership
        if (opportunity.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('You can only upload resources to your own opportunities');
        }
    }

    const resource = await Resource.create({
        title,
        description,
        type,
        url,
        category,
        relatedOpportunity,
        postedBy: req.user._id,
    });

    const populatedResource = await Resource.findById(resource._id).populate('postedBy', 'name role');

    const io = req.app.get('socketio');
    if (io) {
        if (relatedOpportunity) {
            // Target only students viewing this opportunity/project
            io.to(`opportunity_${relatedOpportunity}`).emit('new_resource', populatedResource);
            io.to(`project:${relatedOpportunity}`).emit('material_uploaded', populatedResource);
        } else {
            io.emit('new_resource', populatedResource);
        }
    }

    res.status(201).json(resource);
});

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = asyncHandler(async (req, res) => {
    const { opportunity } = req.query;
    const query = opportunity ? { relatedOpportunity: opportunity } : {};

    const resources = await Resource.find(query)
        .populate({
            path: 'postedBy',
            select: 'name role status',
            match: { status: 'approved' }
        })
        .populate('relatedOpportunity', 'title')
        .sort('-createdAt');

    const filteredResources = resources.filter(res => res.postedBy !== null);
    res.json(filteredResources);
});

module.exports = {
    createResource,
    getResources,
};
