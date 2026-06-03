const mongoose = require('mongoose');

const GeoJSONPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number], // Array of numbers: [longitude, latitude]
    required: [true, 'Coordinates are required in [longitude, latitude] format.'],
    validate: {
      validator: function (coords) {
        if (coords.length !== 2) return false;
        const [lng, lat] = coords;
        return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
      },
      message: 'Coordinates must be valid: longitude between -180 and 180, latitude between -90 and 90.'
    }
  }
}, { _id: false });

const EarthquakeSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: [true, 'Event ID (eventId) is required.'],
    unique: true,
    trim: true,
    index: true
  },
  time: {
    type: Date,
    required: [true, 'Event time is required.'],
    index: true
  },
  location: {
    type: GeoJSONPointSchema,
    required: [true, 'Geospatial location is required.']
  },
  depth: {
    type: Number,
    required: [true, 'Depth is required.'],
    min: [-10, 'Depth cannot be less than -10 km.'], // Some shallow events have negative depths
    index: true
  },
  mag: {
    type: Number,
    required: [true, 'Magnitude is required.'],
    min: [0, 'Magnitude cannot be negative.'],
    index: true
  },
  magType: {
    type: String,
    required: [true, 'Magnitude type is required.'],
    trim: true
  },
  nst: {
    type: Number,
    default: null
  },
  gap: {
    type: Number,
    default: null,
    min: [0, 'Gap cannot be less than 0 degrees.'],
    max: [360, 'Gap cannot exceed 360 degrees.']
  },
  dmin: {
    type: Number,
    default: null
  },
  rms: {
    type: Number,
    default: null,
    min: [0, 'RMS residual must be non-negative.']
  },
  net: {
    type: String,
    required: [true, 'Reporting network code is required.'],
    trim: true,
    index: true
  },
  updated: {
    type: Date,
    required: [true, 'Update timestamp is required.']
  },
  place: {
    type: String,
    required: [true, 'Geographical description of event is required.'],
    trim: true
  },
  country: {
    type: String,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: [true, 'Event type is required.'],
    default: 'earthquake',
    trim: true
  },
  horizontalError: {
    type: Number,
    default: null
  },
  depthError: {
    type: Number,
    default: null
  },
  magError: {
    type: Number,
    default: null
  },
  magNst: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    required: [true, 'Review status is required.'],
    enum: {
      values: ['reviewed', 'automatic'],
      message: 'Status must be either reviewed or automatic.'
    },
    default: 'automatic',
    trim: true
  },
  locationSource: {
    type: String,
    required: [true, 'Location source agency is required.'],
    trim: true
  },
  magSource: {
    type: String,
    required: [true, 'Magnitude source agency is required.'],
    trim: true
  }
}, {
  timestamps: true, // Auto-injects createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==========================================
// 🔍 DATABASE INDEXING CONFIGURATION
// ==========================================

// Compound index for time-mag range queries (most common query path)
EarthquakeSchema.index({ time: -1, mag: -1 });

// Spatial index for geospatial geolocation querying
EarthquakeSchema.index({ location: '2dsphere' });

// Text index on geographical place to support keyword search
EarthquakeSchema.index({ place: 'text' });

// ==========================================
// ⚡ MONGOOSE PRE-SAVE HOOK
// ==========================================

// Pre-save middleware to parse country/region from the place string
EarthquakeSchema.pre('save', function (next) {
  if (this.place && !this.country) {
    const parts = this.place.split(', ');
    if (parts.length > 1) {
      this.country = parts[parts.length - 1].trim();
    } else {
      this.country = 'Oceanic / International Waters';
    }
  }
  next();
});

// ==========================================
// 💎 SCHEMA VIRTUAL PROPERTIES
// ==========================================

// Virtual property representing qualitative magnitude description
EarthquakeSchema.virtual('magnitudeCategory').get(function () {
  if (!this.mag) return 'Unknown';
  if (this.mag < 5.0) return 'Light';
  if (this.mag < 6.0) return 'Moderate';
  if (this.mag < 7.0) return 'Strong';
  if (this.mag < 8.0) return 'Major';
  return 'Great';
});

const Earthquake = mongoose.model('Earthquake', EarthquakeSchema);

module.exports = Earthquake;
