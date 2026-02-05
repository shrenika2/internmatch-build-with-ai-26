const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        targetType: {
            type: String, // 'User', 'Opportunity', 'Post', etc.
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        details: {
            type: String,
        },
        ipAddress: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
