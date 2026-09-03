export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  // Handle entity too large / file limit errors with explicit 413 and user-friendly message
  if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Image is too large. Please upload an image under 10MB.',
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`🚨 [API Error] ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
