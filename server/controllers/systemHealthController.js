const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const os = require('os');
const { getMetrics } = require('../middleware/metricsMiddleware');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Team = require('../models/Team');

// @desc    Get System Health & Metrics
// @route   GET /api/admin/system-health
// @access  Private (Admin)
const getSystemHealth = asyncHandler(async (req, res) => {
    // 1. Process & OS Metrics
    const memoryUsage = process.memoryUsage();
    const systemMetrics = {
        uptime: process.uptime(),
        memory: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            usagePercentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        cpu: {
            loadAvg: os.loadavg(),
            cores: os.cpus().length,
            platform: os.platform()
        }
    };

    // 2. Database Metrics
    const dbStartTime = Date.now();
    const dbStatus = mongoose.connection.readyState;
    let dbLatency = 0;

    if (dbStatus === 1) {
        await mongoose.connection.db.admin().ping();
        dbLatency = Date.now() - dbStartTime;
    }

    // 3. Application Stats
    const [
        students, company, faculty,
        opportunities, applications, teams
    ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'company' }),
        User.countDocuments({ role: 'faculty' }),
        Opportunity.countDocuments(),
        Application.countDocuments(),
        Team.countDocuments()
    ]);

    // 4. Socket.io Metrics
    const io = req.app.get('socketio');
    const activeConnections = io ? io.engine.clientsCount : 0;

    // 5. API Metrics from Middleware
    const apiMetrics = getMetrics();

    res.json({
        success: true,
        timestamp: new Date(),
        system: systemMetrics,
        database: {
            status: dbStatus === 1 ? 'Connected' : 'Disconnected',
            latency: `${dbLatency}ms`,
            readyState: dbStatus
        },
        counts: {
            users: { students, company, faculty, total: students + company + faculty },
            opportunities,
            applications,
            teams
        },
        sockets: {
            activeConnections
        },
        api: apiMetrics
    });
});

module.exports = { getSystemHealth };
