const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const earthquakeRoutes = require('./earthquake.routes');
const authRoutes = require('./auth.routes');

// Mount individual sub-routers
router.use('/health', healthRoutes);
router.use('/earthquakes', earthquakeRoutes);
router.use('/auth', authRoutes);

module.exports = router;
