const cloudinary = require('cloudinary').v2;
const env = require('./env');
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

// Verify configuration (Basic check)
if (!env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    logger.warn('[CLOUD] Cloudinary is not configured correctly. File uploads will fail.');
} else {
    logger.info(`[CLOUD] Cloudinary initialized for cloud: ${env.CLOUDINARY_CLOUD_NAME}`);
}

module.exports = cloudinary;
