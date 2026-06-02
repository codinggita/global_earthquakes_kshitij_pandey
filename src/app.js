const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config');
const connectDB = require('./database');

const app = express();

// ==========================================
// 🛡️ SECURITY & UTILITY MIDDLEWARES
// ==========================================

// Set secure HTTP headers to mitigate cross-site scripting (XSS), clickjacking, etc.
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS) based on configuration origin rules
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Compress response bodies for all requests to improve payload transit times
app.use(compression());

// Parse incoming requests with JSON payloads (max 10kb to prevent Denial of Service)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded payloads (query strings / form data)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

// Setup HTTP request logging using morgan
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==========================================
// 🌐 BASE ROUTES
// ==========================================

// Simple Health Check Endpoint
app.get(`/api/${config.apiVersion}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Global Earthquake Analytics API is online.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: config.env
  });
});

// Fallback Route Handler for 404 (Not Found)
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Resource not found: ${req.originalUrl}`
  });
});

// ==========================================
// 🚀 SERVER INIT
// ==========================================

// Connect to MongoDB Database
connectDB();

const server = app.listen(config.port, () => {
  console.log(`===================================================`);
  console.log(`🌐 Server listening on port: ${config.port}`);
  console.log(`⚙️  Environment: ${config.env}`);
  console.log(`🔗 API Base: http://localhost:${config.port}/api/${config.apiVersion}`);
  console.log(`===================================================`);
});

// Graceful Shutdown Handler
const shutdown = () => {
  console.log('⚠️ Received shutdown signal. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('💤 HTTP server closed. Process terminating...');
    process.exit(0);
  });

  // Force close after 10 seconds if connections hang
  setTimeout(() => {
    console.error('❌ Force shutdown triggered.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
