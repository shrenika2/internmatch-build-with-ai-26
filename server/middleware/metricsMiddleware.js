const metrics = {
    totalRequests: 0,
    totalErrors: 0,
    responseTimes: [],
    lastReset: Date.now()
};

const metricsMiddleware = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        metrics.totalRequests++;

        if (res.statusCode >= 400) {
            metrics.totalErrors++;
        }

        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6);

        metrics.responseTimes.push(timeInMs);

        // Keep only last 100 response times for average
        if (metrics.responseTimes.length > 100) {
            metrics.responseTimes.shift();
        }
    });

    next();
};

const getMetrics = () => {
    const avgResponseTime = metrics.responseTimes.length > 0
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
        : 0;

    return {
        totalRequests: metrics.totalRequests,
        totalErrors: metrics.totalErrors,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        uptime: process.uptime(),
        errorRate: metrics.totalRequests > 0
            ? Math.round((metrics.totalErrors / metrics.totalRequests) * 10000) / 100
            : 0
    };
};

module.exports = { metricsMiddleware, getMetrics };
