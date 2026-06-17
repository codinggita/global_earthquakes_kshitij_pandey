const express = require('express');
const router = express.Router();
const jwtController = require('../controllers/jwt.controller');
const { protect } = require('../middleware/auth.middleware');
const { analyticsLimiter } = require('../middleware/rateLimiter');

// Protect all routes in this router
router.use(protect);

// OPTIONS support
router.options('/profile', (req, res) => {
  res.setHeader('Allow', 'GET, OPTIONS');
  res.status(204).end();
});

router.get('/profile',           jwtController.getProfile);
router.get('/dashboard',         jwtController.getDashboard);
router.get('/private-earthquakes', analyticsLimiter, jwtController.getPrivateEarthquakes);
router.get('/private-analytics',   analyticsLimiter, jwtController.getPrivateAnalytics);

module.exports = router;
