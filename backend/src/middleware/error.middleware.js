const ApiError = require('../utils/api-error');
const logger = require('../config/logger');

/** 404 handler for unknown routes. */
function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/** Translate known Prisma errors into user-safe HTTP errors. */
function normalizeDatabaseError(err) {
  if (!err || typeof err.code !== 'string') return err;
  switch (err.code) {
    case 'P2002':
      return new ApiError(409, 'A record with the provided unique value already exists');
    case 'P2025':
      return new ApiError(404, 'The requested record was not found');
    case 'P2003':
      return new ApiError(400, 'Operation violates a database constraint');
    default:
      return err;
  }
}

/**
 * Centralized error handler. Never leaks stack traces or internal details
 * to clients; 5xx responses are generic and logged server-side.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const normalized = normalizeDatabaseError(err);
  const status = normalized.statusCode || 500;
  const message = normalized.message || 'Internal server error';

  if (status >= 500) {
    logger.json('error', 'Unhandled error', {
      method: req.method,
      path: req.originalUrl,
      error: normalized.message,
      stack: normalized.stack,
    });
  }

  const body = { success: false, message };
  if (normalized.details) body.details = normalized.details;

  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };