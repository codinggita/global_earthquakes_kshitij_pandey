const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');

// Mount individual sub-routers
router.use('/health', healthRoutes);

module.exports = router;
