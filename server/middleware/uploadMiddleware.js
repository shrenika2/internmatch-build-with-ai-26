const multer = require('multer');
const path = require('path');

// Memory storage keeps file in buffer for cloud services
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF and MP4 files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

module.exports = upload;
