const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * @desc      Get API Health status details
 * @route     GET /api/v1/health
 * @access    Public
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Global Earthquake Analytics API is online.',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    env: process.env.NODE_ENV || 'development'
  });
});

module.exports = {
  getHealthStatus
};
