const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment config
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const config = require('../config');
const Earthquake = require('../models/earthquake.model');

// Default dataset path (Checks Downloads folder first, then local directory)
const DEFAULT_DATASET_PATH = process.argv[2] || 
  path.join(process.env.USERPROFILE || 'C:\\Users\\Kshitij Pandey', 'Downloads', 'global_earthquakes_10yrs_M4.5_2025-12-10.json');

// Batch size for MongoDB insertions
const BATCH_SIZE = 1000;

/**
 * Validate and sanitize raw JSON record to map to Mongoose schema
 */
const sanitizeRecord = (raw) => {
  // Check required core fields
  if (!raw.id || !raw.time || !raw.latitude || !raw.longitude || raw.mag === undefined || raw.depth === undefined) {
    return null;
  }

  const lng = parseFloat(raw.longitude);
  const lat = parseFloat(raw.latitude);

  // GeoJSON coordinate validation
  if (isNaN(lng) || lng < -180 || lng > 180 || isNaN(lat) || lat < -90 || lat > 90) {
    return null;
  }

  // Parse helper for floats (converting empty string "" to null)
  const parseNum = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  return {
    eventId: raw.id.trim(),
    time: new Date(raw.time),
    location: {
      type: 'Point',
      coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
    },
    depth: parseFloat(raw.depth),
    mag: parseFloat(raw.mag),
    magType: raw.magType ? raw.magType.trim() : 'unknown',
    nst: parseNum(raw.nst),
    gap: parseNum(raw.gap),
    dmin: parseNum(raw.dmin),
    rms: parseNum(raw.rms),
    net: raw.net ? raw.net.trim() : 'unknown',
    updated: raw.updated ? new Date(raw.updated) : new Date(),
    place: raw.place ? raw.place.trim() : 'Unknown Location',
    type: raw.type ? raw.type.trim() : 'earthquake',
    horizontalError: parseNum(raw.horizontalError),
    depthError: parseNum(raw.depthError),
    magError: parseNum(raw.magError),
    magNst: parseNum(raw.magNst),
    status: raw.status === 'reviewed' ? 'reviewed' : 'automatic',
    locationSource: raw.locationSource ? raw.locationSource.trim() : 'unknown',
    magSource: raw.magSource ? raw.magSource.trim() : 'unknown'
  };
};

const runImporter = async () => {
  const startTime = Date.now();
  console.log('🏁 Starting Global Earthquake Ingestion Pipeline...');
  console.log(`📂 Target Dataset: ${DEFAULT_DATASET_PATH}`);

  // 1. Verify file exists
  if (!fs.existsSync(DEFAULT_DATASET_PATH)) {
    console.error(`❌ Error: Dataset file not found at: ${DEFAULT_DATASET_PATH}`);
    process.exit(1);
  }

  // 2. Connect to MongoDB
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('💚 Database connection established.');
  } catch (err) {
    console.error(`❌ Database connection failed: ${err.message}`);
    process.exit(1);
  }

  // 3. Read and Parse JSON file
  let rawData;
  try {
    console.log('📖 Reading JSON file into memory (this might take a few seconds)...');
    const rawFileContent = fs.readFileSync(DEFAULT_DATASET_PATH, 'utf8');
    console.log('⚡ Parsing JSON structure...');
    rawData = JSON.parse(rawFileContent);
    console.log(`✅ Loaded ${rawData.length} raw records from file.`);
  } catch (err) {
    console.error(`❌ Failed to read or parse JSON file: ${err.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // 4. Ingest using BulkWrite operations in batches to avoid RAM overhead
  let processedCount = 0;
  let successCount = 0;
  let batchOps = [];

  for (let i = 0; i < rawData.length; i++) {
    const sanitized = sanitizeRecord(rawData[i]);
    processedCount++;

    if (sanitized) {
      // Create bulk update operations (Upsert logic to prevent duplicates on eventId)
      batchOps.push({
        updateOne: {
          filter: { eventId: sanitized.eventId },
          update: { $set: sanitized },
          upsert: true
        }
      });
    }

    // Execute bulk execution when limit reached or at end of array
    if (batchOps.length === BATCH_SIZE || (i === rawData.length - 1 && batchOps.length > 0)) {
      try {
        const result = await Earthquake.bulkWrite(batchOps, { ordered: false });
        successCount += (result.upsertedCount + result.modifiedCount + result.matchedCount);
        
        const percent = ((processedCount / rawData.length) * 100).toFixed(1);
        console.log(`🔹 Progress: ${processedCount}/${rawData.length} parsed (${percent}%) | Batch Saved.`);
      } catch (writeErr) {
        console.error(`⚠️ Warning: Batch write error occurred: ${writeErr.message}`);
      }
      // Clear batch array for next loop iteration
      batchOps = [];
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n===================================================');
  console.log('🎉 INGESTION PIPELINE SUMMARY');
  console.log(`⏱️  Time Elapsed: ${durationSec} seconds`);
  console.log(`📥 Total Records Evaluated: ${processedCount}`);
  console.log(`💾 Total Records Successfully Ingested/Synced: ${successCount}`);
  console.log('===================================================');

  // Disconnect from DB
  await mongoose.disconnect();
  console.log('🔌 Database connection closed cleanly.');
  process.exit(0);
};

runImporter();
