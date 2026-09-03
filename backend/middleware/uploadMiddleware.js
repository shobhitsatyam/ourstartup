import multer from 'multer';

// Use memoryStorage so permanent images are never saved to Render's local disk
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype?.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10, // Maximum 10 images
  },
  fileFilter,
});

/**
 * Multer error handling wrapper for production image upload
 */
export const handleUploadMiddleware = (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'Image is too large. Please upload an image under 10MB.',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded. Maximum 10 images allowed.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }
    next();
  });
};
