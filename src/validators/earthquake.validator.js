const { body, param, query } = require('express-validator');

// ==========================================
// CREATE / UPDATE EARTHQUAKE VALIDATORS
// ==========================================

const createEarthquakeRules = [
  body('eventId')
    .notEmpty().withMessage('eventId is required.')
    .isString().withMessage('eventId must be a string.')
    .trim(),

  body('time')
    .notEmpty().withMessage('time is required.')
    .isISO8601().withMessage('time must be a valid ISO 8601 date string (e.g. 2015-12-30T23:20:56.840Z).'),

  body('location.coordinates')
    .notEmpty().withMessage('location.coordinates are required.')
    .isArray({ min: 2, max: 2 }).withMessage('location.coordinates must be an array of exactly 2 values: [longitude, latitude].'),

  body('location.coordinates[0]')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180.'),

  body('location.coordinates[1]')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90.'),

  body('depth')
    .notEmpty().withMessage('depth is required.')
    .isFloat({ min: -10 }).withMessage('depth must be a number greater than or equal to -10.'),

  body('mag')
    .notEmpty().withMessage('mag (magnitude) is required.')
    .isFloat({ min: 0 }).withMessage('Magnitude must be a non-negative number.'),

  body('magType')
    .notEmpty().withMessage('magType is required.')
    .isString().withMessage('magType must be a string.'),

  body('net')
    .notEmpty().withMessage('net (reporting network) is required.')
    .isString().withMessage('net must be a string.'),

  body('updated')
    .notEmpty().withMessage('updated timestamp is required.')
    .isISO8601().withMessage('updated must be a valid ISO 8601 date string.'),

  body('place')
    .notEmpty().withMessage('place is required.')
    .isString().withMessage('place must be a string.'),

  body('status')
    .optional()
    .isIn(['reviewed', 'automatic']).withMessage('status must be either "reviewed" or "automatic".'),

  body('locationSource')
    .notEmpty().withMessage('locationSource is required.')
    .isString().withMessage('locationSource must be a string.'),

  body('magSource')
    .notEmpty().withMessage('magSource is required.')
    .isString().withMessage('magSource must be a string.'),

  // Optional numeric fields
  body('gap')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 360 }).withMessage('gap must be between 0 and 360 degrees.'),

  body('rms')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('rms must be a non-negative number.'),

  body('nst')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('nst must be a non-negative integer.'),

  body('dmin')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('dmin must be a non-negative number.'),

  body('horizontalError')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('horizontalError must be a non-negative number.'),

  body('depthError')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('depthError must be a non-negative number.'),

  body('magError')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('magError must be a non-negative number.'),

  body('magNst')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('magNst must be a non-negative number.')
];

const updateEarthquakeRules = [
  body('time')
    .optional()
    .isISO8601().withMessage('time must be a valid ISO 8601 date string.'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 }).withMessage('location.coordinates must be an array of exactly 2 values: [longitude, latitude].'),

  body('location.coordinates[0]')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180.'),

  body('location.coordinates[1]')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90.'),

  body('depth')
    .optional()
    .isFloat({ min: -10 }).withMessage('depth must be a number greater than or equal to -10.'),

  body('mag')
    .optional()
    .isFloat({ min: 0 }).withMessage('Magnitude must be a non-negative number.'),

  body('status')
    .optional()
    .isIn(['reviewed', 'automatic']).withMessage('status must be either "reviewed" or "automatic".'),

  body('gap')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 360 }).withMessage('gap must be between 0 and 360 degrees.'),

  body('rms')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('rms must be a non-negative number.')
];

// ==========================================
// QUERY PARAMETER VALIDATORS
// ==========================================

const listQueryRules = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('limit must be an integer between 1 and 500.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer.'),

  query('minMagnitude')
    .optional()
    .isFloat({ min: 0 }).withMessage('minMagnitude must be a non-negative number.'),

  query('maxMagnitude')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxMagnitude must be a non-negative number.'),

  query('minDepth')
    .optional()
    .isFloat().withMessage('minDepth must be a valid number.'),

  query('maxDepth')
    .optional()
    .isFloat().withMessage('maxDepth must be a valid number.'),

  query('status')
    .optional()
    .isIn(['reviewed', 'automatic']).withMessage('status must be either "reviewed" or "automatic".'),

  query('year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('year must be a valid 4-digit integer.'),

  query('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('month must be between 1 and 12.'),

  query('sortBy')
    .optional()
    .isIn(['mag', 'depth', 'time', 'gap', 'rms', 'place']).withMessage('sortBy must be one of: mag, depth, time, gap, rms, place.'),

  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('order must be either "asc" or "desc".')
];

// ==========================================
// ROUTE PARAMETER VALIDATORS
// ==========================================

const idParamRules = [
  param('id')
    .notEmpty().withMessage('ID parameter is required.')
    .isString().withMessage('ID must be a valid string.')
    .trim()
];

module.exports = {
  createEarthquakeRules,
  updateEarthquakeRules,
  listQueryRules,
  idParamRules
};
