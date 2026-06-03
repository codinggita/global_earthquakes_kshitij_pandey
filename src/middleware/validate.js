const { validationResult } = require('express-validator');

/**
 * Custom middleware that intercepts validation errors registered by express-validator
 * and returns a standard validation error payload (400 Bad Request)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format error messages to return a clean client response
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed.',
      errors: formattedErrors
    });
  }
  
  next();
};

module.exports = validate;
