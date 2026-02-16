const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

/**
 * Log a system action asynchronously to avoid blocking the main thread.
 * @param {Object} data - The audit log data
 */
const logAction = async ({ userId, action, entityType, entityId, metadata, req }) => {
    try {
        // We don't await this in the controllers to keep them fast
        const auditData = {
            userId,
            action,
            entityType,
            entityId,
            metadata,
            ipAddress: req?.ip,
            userAgent: req?.headers['user-agent']
        };

        // Fire and forget (it's still an async function, but we don't return the promise to be awaited by the caller)
        AuditLog.create(auditData).catch(err => {
            logger.error(`Failed to save audit log: ${err.message}`);
        });

        logger.info(`[AUDIT] Action: ${action} | User: ${userId} | Entity: ${entityType}`);
    } catch (err) {
        logger.error(`Error in audit service: ${err.message}`);
    }
};

module.exports = { logAction };
