const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function storageFor(subfolder) {
  return multer.diskStorage({
    destination: path.join(UPLOAD_ROOT, subfolder),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  });
}

function imageFileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WEBP or GIF images are allowed'));
  }
  cb(null, true);
}

const reviewImageUploadRaw = multer({
  storage: storageFor('reviews'),
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single('image');

const ApiError = require('../utils/ApiError');

// Wraps multer's callback-style middleware so upload errors (bad file type,
// too large) reach the shared error handler as a proper 400 instead of an
// unhandled exception - a submission with no "image" part at all is not an
// error, multer just leaves req.file undefined.
function reviewImageUpload(req, res, next) {
  reviewImageUploadRaw(req, res, (err) => {
    if (!err) return next();
    next(ApiError.badRequest(err.message || 'Could not process the uploaded image'));
  });
}

module.exports = { reviewImageUpload, UPLOAD_ROOT };
