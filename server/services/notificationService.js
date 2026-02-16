const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Notification Service
 * Handles persistence and real-time delivery of notifications
 */
const notificationService = {
    /**
     * Send a notification to a specific user
     * @param {Object} data - Notification details
     * @param {string} data.userId - Recipient user ID
     * @param {string} data.type - Notification type
     * @param {string} data.message - Notification content
     * @param {string} data.title - Optional title
     * @param {string} data.priority - low, medium, high
     * @param {string} data.senderId - Optional sender ID
     * @param {string} data.link - Optional redirection link
     * @param {Object} data.metadata - Optional extra data
     * @param {Object} io - Socket.io instance
     */
    sendNotification: async (data, io) => {
        try {
            const { userId, type, message, title, priority, senderId, link, metadata } = data;

            // 1. Persist to Database
            const notification = await Notification.create({
                userId,
                type,
                message,
                title: title || 'System Update',
                priority: priority || 'low',
                sender: senderId,
                link,
                metadata: metadata || {}
            });

            // 2. Immediate real-time delivery
            if (io) {
                io.to(userId.toString()).emit('notification:new', notification);
                logger.debug(`[NOTIFICATION] Real-time delivery to user ${userId}`);
            }

            return notification;
        } catch (error) {
            logger.error(`[NOTIFICATION_SERVICE] Error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Notify multiple users (e.g. broadcast)
     */
    broadcast: async (data, userIds, io) => {
        try {
            const notifications = userIds.map(userId => ({
                userId,
                type: data.type,
                title: data.title,
                message: data.message,
                priority: data.priority || 'low',
                sender: data.senderId,
                link: data.link,
                metadata: data.metadata || {}
            }));

            const createdLogs = await Notification.insertMany(notifications);

            if (io) {
                userIds.forEach(userId => {
                    io.to(userId.toString()).emit('notification:new', createdLogs.find(l => l.userId.toString() === userId.toString()));
                });
            }

            return createdLogs;
        } catch (error) {
            logger.error(`[NOTIFICATION_SERVICE] Broadcast Error: ${error.message}`);
            throw error;
        }
    }
};

module.exports = notificationService;
