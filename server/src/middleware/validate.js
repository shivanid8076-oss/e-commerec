// ============================================
// Joi Validation Middleware Factory
// Validates request data against Joi schemas
// ============================================

/**
 * Creates a validation middleware for a given Joi schema
 * @param {Object} schema - Joi schema object with body/query/params keys
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each part of the request
    for (const key of ['body', 'query', 'params']) {
      if (schema[key]) {
        const { error, value } = schema[key].validate(req[key], {
          abortEarly: false, // Return all errors, not just the first
          stripUnknown: true, // Remove unknown fields
        });

        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              field: detail.path.join('.'),
              message: detail.message.replace(/"/g, ''),
            }))
          );
        } else {
          // Replace with validated + sanitized values
          req[key] = value;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    next();
  };
};

module.exports = { validate };
