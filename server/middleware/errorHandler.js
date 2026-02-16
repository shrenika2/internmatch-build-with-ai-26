const logger = require('../utils/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
        requestId: req.id, // Set by request ID middleware
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    // Global Logging
    logger.error(`[${req.id}] ${req.method} ${req.originalUrl} - status: ${statusCode} - message: ${err.message}`);

    if (env.NODE_ENV === 'development' && err.stack) {
        logger.debug(err.stack);
    }

    res.status(statusCode).json(errorResponse);
};

const notFound = (req, res, next) => {
    const error = new Error(`Node not found in sequence: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
