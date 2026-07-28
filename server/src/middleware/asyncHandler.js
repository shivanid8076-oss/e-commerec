/**
 * Async Handler to wrap controller functions
 * Prevents the need for repetitive try-catch blocks in every controller method.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
