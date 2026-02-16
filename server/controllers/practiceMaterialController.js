const asyncHandler = require('express-async-handler');
const PracticeMaterial = require('../models/PracticeMaterial');
const Application = require('../models/Application');
const mongoose = require('mongoose');
const fileService = require('../services/fileService');
const { logAction } = require('../utils/auditService');

// @desc    Upload practice material
// @route   POST /api/practice/upload
// @access  Private (Company/Faculty)
const uploadMaterial = asyncHandler(async (req, res) => {
    const { title, description, type, link, visibility, linkedOpportunity } = req.body;

    let fileUrl = '';
    let cloudPublicId = '';

    if (type === 'link') {
        fileUrl = link;
    } else {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        // Upload to Cloudinary
        const resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'raw';
        const uploadResult = await fileService.uploadFromBuffer(req.file.buffer, {
            resource_type: resourceType,
            folder: `pict_portal/practice/${req.user.role}`,
            public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`
        });

        fileUrl = uploadResult.secure_url;
        cloudPublicId = uploadResult.public_id;
    }

    const material = await PracticeMaterial.create({
        title,
        description,
        type,
        fileUrl,
        uploadedBy: req.user._id,
        role: req.user.role,
        linkedOpportunity: linkedOpportunity || null,
        visibility: visibility || 'public',
        metadata: {
            cloudPublicId,
            originalName: req.file ? req.file.originalname : null,
            size: req.file ? req.file.size : null
        }
    });

    logAction({
        userId: req.user._id,
        action: 'PRACTICE_MATERIAL_UPLOAD',
        entityType: 'PracticeMaterial',
        entityId: material._id,
        metadata: { title, type },
        req
    });

    res.status(201).json(material);
});

// @desc    Get materials for student
// @route   GET /api/practice/student
// @access  Private (Student)
const getStudentMaterials = asyncHandler(async (req, res) => {
    // 1. Get public materials
    // 2. Get materials linked to opportunities student applied for

    const appliedOpportunities = await Application.find({ studentId: req.user._id }).select('opportunityId');
    const oppIds = appliedOpportunities.map(app => app.opportunityId);

    const materials = await PracticeMaterial.find({
        $or: [
            { visibility: 'public' },
            { linkedOpportunity: { $in: oppIds } }
        ]
    }).populate('uploadedBy', 'name companyProfile facultyProfile');

    res.json(materials);
});

// @desc    Get company specific materials
// @route   GET /api/practice/company/:id
// @access  Private
const getCompanyMaterials = asyncHandler(async (req, res) => {
    const materials = await PracticeMaterial.find({ uploadedBy: req.params.id, role: 'company' });
    res.json(materials);
});

// @desc    Get faculty specific materials
// @route   GET /api/practice/faculty/:id
// @access  Private
const getFacultyMaterials = asyncHandler(async (req, res) => {
    const materials = await PracticeMaterial.find({ uploadedBy: req.params.id, role: 'faculty' });
    res.json(materials);
});

// @desc    Delete practice material
// @route   DELETE /api/practice/material/:id
// @access  Private (Uploader only)
const deleteMaterial = asyncHandler(async (req, res) => {
    const material = await PracticeMaterial.findById(req.params.id);

    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    if (material.uploadedBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this material');
    }

    if (material.metadata && material.metadata.cloudPublicId) {
        await fileService.deleteFile(material.metadata.cloudPublicId);
    }

    logAction({
        userId: req.user._id,
        action: 'PRACTICE_MATERIAL_DELETE',
        entityType: 'PracticeMaterial',
        entityId: material._id,
        metadata: { title: material.title },
        req
    });

    await material.deleteOne();
    res.json({ message: 'Material removed' });
});

module.exports = {
    uploadMaterial,
    getStudentMaterials,
    getCompanyMaterials,
    getFacultyMaterials,
    deleteMaterial
};
