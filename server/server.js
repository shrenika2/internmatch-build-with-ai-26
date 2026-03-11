const connectDB = require('./config/db');
const { server } = require('./app');
const env = require('./config/env');
const seedAdmin = require('./seed/adminSeed');

// Connect to database and seed
connectDB().then(() => {
    seedAdmin();
});

const PORT = env.PORT || 5000;

const serverInstance = server.listen(PORT, () => {
    console.log(`[SERVER] Running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = () => {
    console.log('[SERVER] SIGTERM/SIGINT received. Shutting down gracefully...');
    serverInstance.close(() => {
        console.log('[SERVER] HTTP server closed.');
        process.exit(0);
    });

    // Force shutdown if it takes too long
    setTimeout(() => {
        console.error('[SERVER] Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error('[CORE] UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);

    // In production, you might want to report this to Sentry before exit
    const Sentry = require("@sentry/node");
    if (env.SENTRY_DSN) {
        Sentry.captureException(err);
    }

    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('[CORE] UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);

    const Sentry = require("@sentry/node");
    if (env.SENTRY_DSN) {
        Sentry.captureException(err);
    }

    serverInstance.close(() => {
        process.exit(1);
    });
});
