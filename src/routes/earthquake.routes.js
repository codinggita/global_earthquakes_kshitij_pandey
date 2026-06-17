const express = require('express');
const router = express.Router();
const earthquakeController = require('../controllers/earthquake.controller');
const {
  createEarthquakeRules,
  updateEarthquakeRules,
  listQueryRules,
  idParamRules
} = require('../validators/earthquake.validator');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { analyticsLimiter, searchLimiter, adminLimiter } = require('../middleware/rateLimiter');
const cache = require('../middleware/cache');

// ── Collection routes ───────────────────────────────────────────────────────
// HEAD   /earthquakes → responds with status/headers, no body (metadata check)
// GET    /earthquakes → public list with search/filter/pagination
// POST   /earthquakes → admin only
router.route('/')
  .head((req, res) => res.status(200).end())
  .options((req, res) => {
    res.setHeader('Allow', 'HEAD, GET, POST, OPTIONS');
    res.status(204).end();
  })
  .get(searchLimiter, listQueryRules, validate, cache(30), earthquakeController.getEarthquakes)
  .post(protect, restrictTo('admin'), adminLimiter, createEarthquakeRules, validate, earthquakeController.createEarthquake);

// ── Stats route ─────────────────────────────────────────────────────────────
// HEAD   /earthquakes/stats → count metadata only
// GET    /earthquakes/stats → authenticated, cached 60s, rate-limited
router.route('/stats')
  .head(protect, (req, res) => res.status(200).end())
  .get(protect, analyticsLimiter, cache(60), earthquakeController.getEarthquakeStats);

// ── Document routes ─────────────────────────────────────────────────────────
// HEAD   /earthquakes/:id → check existence without body
// GET    /earthquakes/:id → public, cached 30s
// PATCH  /earthquakes/:id → admin only
// DELETE /earthquakes/:id → admin only
router.route('/:id')
  .head(idParamRules, validate, (req, res) => res.status(200).end())
  .options((req, res) => {
    res.setHeader('Allow', 'HEAD, GET, PATCH, DELETE, OPTIONS');
    res.status(204).end();
  })
  .get(idParamRules, validate, cache(30), earthquakeController.getEarthquakeById)
  .patch(protect, restrictTo('admin'), adminLimiter, idParamRules, updateEarthquakeRules, validate, earthquakeController.updateEarthquake)
  .delete(protect, restrictTo('admin'), adminLimiter, idParamRules, validate, earthquakeController.deleteEarthquake);

module.exports = router;
