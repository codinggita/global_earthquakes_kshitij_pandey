const mongoose = require('mongoose');
const config = require('../config');

// Connection pooling and timeout configurations for high-performance production workloads
const options = {
  maxPoolSize: 10,                 // Maintain up to 10 concurrent socket connections
  serverSelectionTimeoutMS: 5000,  // Keep trying to send operations for 5 sec before failing
  socketTimeoutMS: 45000,          // Close double-inactive sockets after 45 seconds
  family: 4                        // Force IPv4 to prevent local address resolution latency
};

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

const connectDB = async () => {
  try {
    console.log('🔄 Attempting connection to MongoDB database...');
    await mongoose.connect(config.mongodbUri, options);
  } catch (error) {
    console.error(`❌ MongoDB connection failed on attempt ${retryCount + 1}: ${error.message}`);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🕒 Retrying database connection in ${RETRY_INTERVAL_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_INTERVAL_MS);
    } else {
      console.error('💥 Critical Error: Max database reconnection retries exceeded. Exiting process...');
      process.exit(1);
    }
  }
};

// ==========================================
// 🔔 MONGOOSE CONNECTION EVENT LIFECYCLE
// ==========================================

mongoose.connection.on('connected', () => {
  console.log('💚 MongoDB successfully connected and established.');
  retryCount = 0; // Reset connection attempts on successful connection
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose default connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB successfully reconnected.');
});

// Capture process termination and close MongoDB connections gracefully
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('💤 Mongoose connection disconnected through application termination.');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error during Mongoose connection closure: ${err.message}`);
    process.exit(1);
  }
});

module.exports = connectDB;
