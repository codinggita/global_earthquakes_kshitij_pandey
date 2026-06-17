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

// GET /api/v1/earthquakes  — public
// POST /api/v1/earthquakes — admin only
router.route('/')
  .get(listQueryRules, validate, earthquakeController.getEarthquakes)
  .post(protect, restrictTo('admin'), createEarthquakeRules, validate, earthquakeController.createEarthquake);

// GET /api/v1/earthquakes/stats — requires login (any role)
router.route('/stats')
  .get(protect, earthquakeController.getEarthquakeStats);

// GET    /api/v1/earthquakes/:id — public
// PATCH  /api/v1/earthquakes/:id — admin only
// DELETE /api/v1/earthquakes/:id — admin only
router.route('/:id')
  .get(idParamRules, validate, earthquakeController.getEarthquakeById)
  .patch(protect, restrictTo('admin'), idParamRules, updateEarthquakeRules, validate, earthquakeController.updateEarthquake)
  .delete(protect, restrictTo('admin'), idParamRules, validate, earthquakeController.deleteEarthquake);

module.exports = router;
