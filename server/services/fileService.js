const cloudinary = require('../config/cloud');
const logger = require('../utils/logger');
const streamifier = require('streamifier'); // Usually comes with cloudinary related packages or can be easily added

/**
 * Service to handle file uploads to Cloudinary
 */
const fileService = {
    /**
     * Upload a file from buffer (Multer memoryStorage)
     * @param {Buffer} fileBuffer - The file buffer from req.file
     * @param {Object} options - Cloudinary upload options (folder, resource_type, etc.)
     * @returns {Promise<Object>} - The Cloudinary upload result
     */
    uploadFromBuffer: (fileBuffer, options = {}) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'pict_portal',
                    ...options
                },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        logger.error(`[FILE_SERVICE] Upload failed: ${error.message}`);
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
    },

    /**
     * Upload a file from path (Multer diskStorage - for backward compat if needed)
     * @param {string} filePath - Local path to the file
     * @param {Object} options - Cloudinary upload options
     */
    uploadFromPath: async (filePath, options = {}) => {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'pict_portal',
                ...options
            });
            return result;
        } catch (error) {
            logger.error(`[FILE_SERVICE] Path upload failed: ${error.message}`);
            throw error;
        }
    },

    /**
     * Delete a file from Cloudinary
     * @param {string} publicId - The public ID of the file
     */
    deleteFile: async (publicId) => {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            logger.error(`[FILE_SERVICE] Delete failed: ${error.message}`);
            throw error;
        }
    }
};

module.exports = fileService;
