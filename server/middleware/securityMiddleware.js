const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * General API Rate Limiter
 * Limits requests per window to prevent brute force and DoS
 */
const apiLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX,
    message: {
        message: 'Too many requests from this IP, please try again later.'
    },
    handler: (req, res, next, options) => {
        logger.warn(`[SECURITY] Rate limit exceeded for IP: ${req.ip} - Path: ${req.originalUrl}`);
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Auth Routes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per 15 mins
    message: {
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        logger.error(`[SECURITY] AUTH ABUSE DETECTED: Multiple attempts from IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Security Hardening Middleware
 */
const securityHardening = (app) => {
    // Apply global rate limiting
    app.use('/api/', apiLimiter);

    // Apply strict limiting to auth
    app.use('/api/auth/', authLimiter);
};

module.exports = {
    apiLimiter,
    authLimiter,
    securityHardening
};
