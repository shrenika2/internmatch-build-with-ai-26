const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const logger = require('../utils/logger');

const isProd = env.NODE_ENV === 'production';

if (!isProd) {
    console.log("⚠️  [SYSTEM] RATE LIMITING RELAXED FOR DEVELOPMENT");
}

/**
 * General API Rate Limiter
 * Limits requests per window to prevent brute force and DoS
 */
const apiLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
    max: isProd ? (env.RATE_LIMIT_MAX || 100) : 10000, // 10k in dev, env-based in prod
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    handler: (req, res, next, options) => {
        const remaining = req.rateLimit.remaining;
        logger.warn(`[SECURITY] Rate Limit Triggered: IP ${req.ip} | Route: ${req.originalUrl} | Method: ${req.method}`);
        console.warn(`🛑 [RATE LIMIT] IP ${req.ip} exceeded quota on ${req.originalUrl}`);
        res.status(options.statusCode).json(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !isProd, // EXPERIMENTAL: Skip rate limiting entirely in development if needed
});

/**
 * Strict Rate Limiter for Auth Routes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProd ? 5 : 1000, // Strict 5 attempts in prod, 1000 in dev
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        logger.error(`[SECURITY] AUTH ABUSE DETECTED: Multiple attempts from IP: ${req.ip} on ${req.originalUrl}`);
        console.error(`🚨 [AUTH LIMIT] Abuse detected from IP ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Security Hardening Middleware
 */
const securityHardening = (app) => {
    // Apply global rate limiting
    // In dev, max is 10k and we can skip, but applying it ensures the middleware is tested
    app.use('/api/', apiLimiter);
    app.use('/api/auth/', authLimiter);
};

module.exports = {
    apiLimiter,
    authLimiter,
    securityHardening
};
