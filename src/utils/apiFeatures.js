class APIFeatures {
  /**
   * @param {object} query - Mongoose Query object (e.g. Earthquake.find())
   * @param {object} queryString - Express req.query object containing filters, sort, etc.
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * 1. Filtering logic for specific earthquake query parameters
   */
  filter() {
    const queryObj = { ...this.queryString };
    
    // Fields to exclude from direct database property match
    const excludedFields = [
      'page', 'sort', 'limit', 'fields', 'sortBy', 'order',
      'minMagnitude', 'maxMagnitude', 'minDepth', 'maxDepth',
      'startDate', 'endDate', 'year', 'month', 'search',
      'latitude', 'longitude', 'maxDistance'
    ];
    
    excludedFields.forEach(el => delete queryObj[el]);

    // 1A) Advanced Range Filters (Magnitude, Depth)
    if (this.queryString.minMagnitude || this.queryString.maxMagnitude) {
      queryObj.mag = {};
      if (this.queryString.minMagnitude) queryObj.mag.$gte = parseFloat(this.queryString.minMagnitude);
      if (this.queryString.maxMagnitude) queryObj.mag.$lte = parseFloat(this.queryString.maxMagnitude);
    }

    if (this.queryString.minDepth || this.queryString.maxDepth) {
      queryObj.depth = {};
      if (this.queryString.minDepth) queryObj.depth.$gte = parseFloat(this.queryString.minDepth);
      if (this.queryString.maxDepth) queryObj.depth.$lte = parseFloat(this.queryString.maxDepth);
    }

    // 1B) Date Filters (startDate/endDate, year, month)
    if (this.queryString.startDate || this.queryString.endDate) {
      queryObj.time = {};
      if (this.queryString.startDate) queryObj.time.$gte = new Date(this.queryString.startDate);
      if (this.queryString.endDate) queryObj.time.$lte = new Date(this.queryString.endDate);
    } else if (this.queryString.year) {
      const year = parseInt(this.queryString.year, 10);
      let start, end;
      
      if (this.queryString.month) {
        const month = parseInt(this.queryString.month, 10) - 1; // JS months are 0-11
        start = new Date(Date.UTC(year, month, 1));
        end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      } else {
        start = new Date(Date.UTC(year, 0, 1));
        end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      }
      queryObj.time = { $gte: start, $lte: end };
    }

    // 1C) Geospatial Location Filter ($near)
    if (this.queryString.latitude && this.queryString.longitude) {
      const lat = parseFloat(this.queryString.latitude);
      const lng = parseFloat(this.queryString.longitude);
      
      // Default maximum distance is 500km, converted to meters
      const maxDistanceKm = parseFloat(this.queryString.maxDistance) || 500;
      const maxDistanceMeters = maxDistanceKm * 1000;

      queryObj.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON format requires [longitude, latitude]
          },
          $maxDistance: maxDistanceMeters
        }
      };
    }

    // 1D) Keyword Text Search on geographic place ($text)
    if (this.queryString.search) {
      queryObj.$text = { $search: this.queryString.search };
    }

    // Apply filters to mongoose query
    this.query = this.query.find(queryObj);

    return this;
  }

  /**
   * 2. Sorting logic
   */
  sort() {
    if (this.queryString.sortBy) {
      const sortBy = this.queryString.sortBy;
      const order = this.queryString.order === 'asc' ? 1 : -1;
      this.query = this.query.sort({ [sortBy]: order });
    } else {
      // Default fallback: sort by time (latest first)
      this.query = this.query.sort({ time: -1 });
    }

    return this;
  }

  /**
   * 3. Select fields (optional projection)
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Exclude internal mongoose version flag __v by default
      this.query = this.query.select('-__v');
    }

    return this;
  }
}

module.exports = APIFeatures;
