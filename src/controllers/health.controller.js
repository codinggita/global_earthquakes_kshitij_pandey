/**
 * @desc      Get API Health status details
 * @route     GET /api/v1/health
 * @access    Public
 */
const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Global Earthquake Analytics API is online.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
};

module.exports = {
  getHealthStatus
};
