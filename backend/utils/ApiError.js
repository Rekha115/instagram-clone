/**
 * Custom error class used throughout controllers so the global
 * error handler can respond with the correct HTTP status code
 * and a clean, client-safe message.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
