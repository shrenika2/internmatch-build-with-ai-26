const asyncHandler = require('express-async-handler');
const settingsService = require('../utils/settingsService');
const AuditLog = require('../models/AuditLog');

// @desc    Get Platform Settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings();
    res.json(settings);
});

// @desc    Update Platform Settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
    const oldSettings = await settingsService.getSettings();
    const newSettings = req.body;

    const updatedSettings = await settingsService.updateSettings(newSettings, req.user._id);

    // 1. Log Audit Record
    // Find what changed
    const changes = [];
    Object.keys(newSettings).forEach(key => {
        // Simple comparison for primitives and arrays
        if (JSON.stringify(oldSettings[key]) !== JSON.stringify(newSettings[key])) {
            changes.push({
                field: key,
                oldValue: oldSettings[key],
                newValue: newSettings[key]
            });
        }
    });

    if (changes.length > 0) {
        await AuditLog.create({
            admin: req.user._id,
            action: 'UPDATE_SETTINGS',
            targetType: 'AdminSetting',
            targetId: updatedSettings._id,
            details: JSON.stringify(changes),
            ipAddress: req.ip
        });
    }

    // 2. Emit Socket Event
    const io = req.app.get('socketio');
    if (io) {
        io.emit('settings:updated', {
            updatedBy: {
                _id: req.user._id,
                name: req.user.name
            },
            timestamp: updatedSettings.updatedAt
        });
    }

    res.json(updatedSettings);
});

module.exports = {
    getSettings,
    updateSettings
};
