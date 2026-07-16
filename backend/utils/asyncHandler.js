/**
 * Wraps an async Express route handler so any rejected promise
 * is automatically forwarded to the error-handling middleware,
 * eliminating repetitive try/catch blocks in controllers.
 *
 * @param {Function} fn - async (req, res, next) => {}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
