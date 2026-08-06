const ApiError = require('../utils/ApiError');
const { nodeEnv } = require('../config/env');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Must be registered last. Express recognizes it as an error handler by its 4-arg signature.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Internal server error';

  if (!isApiError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: isApiError ? err.details : undefined,
    stack: nodeEnv === 'development' ? err.stack : undefined,
  });
}

module.exports = { notFoundHandler, errorHandler };
