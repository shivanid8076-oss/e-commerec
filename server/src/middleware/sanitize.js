// ============================================
// XSS Sanitization Middleware (Optimized)
// Recursively sanitizes all user input
// Skips Base64 image fields to prevent ReDoS
// ============================================

const xss = require('xss');

// Custom XSS options — strip all tags
const xssOptions = {
  whiteList: {}, // No tags allowed
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

// Fields that contain Base64 data (skip XSS filtering to avoid ReDoS / Event Loop freeze)
const SKIP_FIELDS = ['images', 'image'];

/**
 * Recursively sanitize a value
 * @param {*} value - The value to sanitize
 * @param {string} fieldName - The key name (used to skip image fields)
 */
function sanitizeValue(value, fieldName = '') {
  // Skip Base64 image fields — they are never rendered as HTML
  if (SKIP_FIELDS.includes(fieldName)) {
    return value;
  }

  if (typeof value === 'string') {
    return xss(value, xssOptions);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, fieldName));
  }

  if (value !== null && typeof value === 'object') {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      sanitized[key] = sanitizeValue(value[key], key);
    }
    return sanitized;
  }

  return value;
}

/**
 * Middleware to sanitize req.body, req.query, and req.params
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

module.exports = { sanitizeInput };
