const mongoose = require('mongoose');
const Earthquake = require('../models/earthquake.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendNoContent, sendPaginated } = require('../utils/responseFormatter');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc      Create a new earthquake record
 * @route     POST /api/v1/earthquakes
 * @access    Public
 */
const createEarthquake = asyncHandler(async (req, res, next) => {
  const newEarthquake = await Earthquake.create(req.body);
  sendCreated(res, { earthquake: newEarthquake });
});

/**
 * @desc      Get all earthquake records with filtering, sorting and pagination
 * @route     GET /api/v1/earthquakes
 * @access    Public
 */
const getEarthquakes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const features = new APIFeatures(Earthquake.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  // Get total count of matching documents for pagination metadata calculations
  const total = await Earthquake.countDocuments(features.query.getFilter());

  // Apply skip-limit logic to query
  features.paginate();

  const earthquakes = await features.query;
  
  sendPaginated(res, earthquakes, total, page, limit, 'earthquakes');
});

/**
 * @desc      Get a single earthquake by MongoDB ObjectId or custom eventId
 * @route     GET /api/v1/earthquakes/:id
 * @access    Public
 */
const getEarthquakeById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let earthquake;

  if (mongoose.Types.ObjectId.isValid(id)) {
    earthquake = await Earthquake.findById(id);
  } else {
    earthquake = await Earthquake.findOne({ eventId: id });
  }

  if (!earthquake) {
    return next(new AppError(`No earthquake found with identifier: ${id}`, 404));
  }

  sendSuccess(res, { earthquake });
});

/**
 * @desc      Partially update an earthquake record
 * @route     PATCH /api/v1/earthquakes/:id
 * @access    Public
 */
const updateEarthquake = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let earthquake;

  if (mongoose.Types.ObjectId.isValid(id)) {
    earthquake = await Earthquake.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
  } else {
    earthquake = await Earthquake.findOneAndUpdate({ eventId: id }, req.body, {
      new: true,
      runValidators: true
    });
  }

  if (!earthquake) {
    return next(new AppError(`No earthquake found with identifier: ${id}`, 404));
  }

  sendSuccess(res, { earthquake });
});

/**
 * @desc      Delete an earthquake record
 * @route     DELETE /api/v1/earthquakes/:id
 * @access    Public
 */
const deleteEarthquake = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let earthquake;

  if (mongoose.Types.ObjectId.isValid(id)) {
    earthquake = await Earthquake.findByIdAndDelete(id);
  } else {
    earthquake = await Earthquake.findOneAndDelete({ eventId: id });
  }

  if (!earthquake) {
    return next(new AppError(`No earthquake found with identifier: ${id}`, 404));
  }

  sendNoContent(res);
});

module.exports = {
  createEarthquake,
  getEarthquakes,
  getEarthquakeById,
  updateEarthquake,
  deleteEarthquake
};
