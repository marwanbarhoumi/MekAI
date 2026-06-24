const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Stockage en mémoire (buffer) — on upload manuellement vers Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées.'));
    }
  },
});

const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

/**
 * Upload un buffer vers Cloudinary et retourne l'URL publique (ou null si non configuré)
 */
const uploadToCloudinary = (buffer, mimetype) => {
  if (!isCloudinaryConfigured()) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'mekai/diagnostics', transformation: [{ width: 1200, crop: 'limit' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary, isCloudinaryConfigured };