const User = require('../models/User');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const AuditLog = require('../models/AuditLog');
const PracticeAttempt = require('../models/PracticeAttempt');
const mongoose = require('mongoose');

// Simple In-Memory Cache
let cache = {
    data: null,
    timestamp: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Analytics Service
 * Uses MongoDB Aggregation Pipelines for high-performance real-time data
 */
const analyticsService = {
    /**
     * Get User Engagement Stats
     */
    getUserEngagement: async () => {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    }
                }
            }
        ]);

        const recentActivity = await AuditLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfWeek: '$createdAt' },
                        action: '$action'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.day': 1 } }
        ]);

        return { stats, recentActivity };
    },

    /**
     * Get Application Funnel Stats
     */
    getApplicationFunnel: async () => {
        const funnel = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const trends = await Application.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return { funnel, trends };
    },

    /**
     * Get Readiness and Performance Trends
     */
    getReadinessTrends: async () => {
        // Average scores across different practice modules
        const scoreTrends = await PracticeAttempt.aggregate([
            {
                $group: {
                    _id: '$module',
                    avgScore: { $avg: '$score' },
                    attempts: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'practicemodules',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'moduleInfo'
                }
            },
            { $unwind: '$moduleInfo' },
            {
                $project: {
                    moduleName: '$moduleInfo.name',
                    avgScore: 1,
                    attempts: 1
                }
            }
        ]);

        return scoreTrends;
    },

    /**
     * Get Overview for Admin Dashboard
     */
    getDashboardOverview: async (forceRefresh = false) => {
        const now = Date.now();
        if (!forceRefresh && cache.data && (now - cache.timestamp < CACHE_DURATION)) {
            return cache.data;
        }

        const [engagement, applications, readiness] = await Promise.all([
            analyticsService.getUserEngagement(),
            analyticsService.getApplicationFunnel(),
            analyticsService.getReadinessTrends()
        ]);

        cache.data = {
            engagement,
            applications,
            readiness,
            lastUpdated: new Date()
        };
        cache.timestamp = now;

        return cache.data;
    }
};

module.exports = analyticsService;
