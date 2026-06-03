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

// GET /api/v1/earthquakes & POST /api/v1/earthquakes
router.route('/')
  .get(listQueryRules, validate, earthquakeController.getEarthquakes)
  .post(createEarthquakeRules, validate, earthquakeController.createEarthquake);

// GET /api/v1/earthquakes/stats
router.route('/stats')
  .get(earthquakeController.getEarthquakeStats);

// GET, PATCH, DELETE /api/v1/earthquakes/:id
router.route('/:id')
  .get(idParamRules, validate, earthquakeController.getEarthquakeById)
  .patch(idParamRules, updateEarthquakeRules, validate, earthquakeController.updateEarthquake)
  .delete(idParamRules, validate, earthquakeController.deleteEarthquake);

module.exports = router;

