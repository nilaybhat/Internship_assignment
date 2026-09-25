/**
 * Error type that carries an HTTP status code and optional validation details.
 * Every route error is translated through this type before reaching the
 * centralized error handler.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, ApiError);
  }
}

module.exports = ApiError;