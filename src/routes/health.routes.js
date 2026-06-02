const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

// GET /api/v1/health -> maps to getHealthStatus controller
router.get('/', healthController.getHealthStatus);

module.exports = router;
