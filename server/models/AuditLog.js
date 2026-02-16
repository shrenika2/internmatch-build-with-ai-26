const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        entityType: {
            type: String,
            required: true,
            index: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        ipAddress: String,
        userAgent: String,
    },
    {
        timestamps: true,
    }
);

// Index for fast chronological retrieval and filtering
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
