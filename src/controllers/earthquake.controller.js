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

/**
 * @desc      Get advanced earthquake aggregation statistics
 * @route     GET /api/v1/earthquakes/stats
 * @access    Public
 */
const getEarthquakeStats = asyncHandler(async (req, res, next) => {
  // 1. Overall stats
  const overallStats = await Earthquake.aggregate([
    {
      $group: {
        _id: null,
        totalEarthquakes: { $sum: 1 },
        avgMagnitude: { $avg: '$mag' },
        minMagnitude: { $min: '$mag' },
        maxMagnitude: { $max: '$mag' },
        avgDepth: { $avg: '$depth' },
        minDepth: { $min: '$depth' },
        maxDepth: { $max: '$depth' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEarthquakes: 1,
        avgMagnitude: { $round: ['$avgMagnitude', 2] },
        minMagnitude: 1,
        maxMagnitude: 1,
        avgDepth: { $round: ['$avgDepth', 2] },
        minDepth: 1,
        maxDepth: 1
      }
    }
  ]);

  // 2. Group by country (Top 10 country/region spots, computed dynamically from place field)
  const statsByCountry = await Earthquake.aggregate([
    {
      $project: {
        mag: 1,
        depth: 1,
        placeParts: { $split: ['$place', ', '] }
      }
    },
    {
      $project: {
        mag: 1,
        depth: 1,
        country: { $arrayElemAt: ['$placeParts', -1] }
      }
    },
    {
      $group: {
        _id: '$country',
        count: { $sum: 1 },
        avgMagnitude: { $avg: '$mag' },
        avgDepth: { $avg: '$depth' }
      }
    },
    {
      $project: {
        country: { $ifNull: ['$_id', 'Oceanic / International Waters'] },
        _id: 0,
        count: 1,
        avgMagnitude: { $round: ['$avgMagnitude', 2] },
        avgDepth: { $round: ['$avgDepth', 2] }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // 3. Group by magnitude category (Computed dynamically)
  const statsByCategory = await Earthquake.aggregate([
    {
      $project: {
        mag: 1,
        depth: 1,
        magnitudeCategory: {
          $switch: {
            branches: [
              { case: { $lt: ['$mag', 5.0] }, then: 'Light' },
              { case: { $lt: ['$mag', 6.0] }, then: 'Moderate' },
              { case: { $lt: ['$mag', 7.0] }, then: 'Strong' },
              { case: { $lt: ['$mag', 8.0] }, then: 'Major' }
            ],
            default: 'Great'
          }
        }
      }
    },
    {
      $group: {
        _id: '$magnitudeCategory',
        count: { $sum: 1 },
        avgMagnitude: { $avg: '$mag' },
        avgDepth: { $avg: '$depth' }
      }
    },
    {
      $project: {
        category: '$_id',
        _id: 0,
        count: 1,
        avgMagnitude: { $round: ['$avgMagnitude', 2] },
        avgDepth: { $round: ['$avgDepth', 2] }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // 4. Time series: Group by year-month
  const statsByTime = await Earthquake.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$time' },
          month: { $month: '$time' }
        },
        count: { $sum: 1 },
        avgMagnitude: { $avg: '$mag' }
      }
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        _id: 0,
        count: 1,
        avgMagnitude: { $round: ['$avgMagnitude', 2] }
      }
    },
    { $sort: { year: -1, month: -1 } },
    { $limit: 12 } // Last 12 active months
  ]);

  sendSuccess(res, {
    summary: overallStats[0] || {},
    byCountry: statsByCountry,
    byCategory: statsByCategory,
    byTime: statsByTime
  });
});

module.exports = {
  createEarthquake,
  getEarthquakes,
  getEarthquakeById,
  updateEarthquake,
  deleteEarthquake,
  getEarthquakeStats
};
