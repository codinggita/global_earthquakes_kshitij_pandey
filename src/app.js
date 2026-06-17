const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config');
const connectDB = require('./database');
const routes = require('./routes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');
const requestTimer = require('./middleware/requestTimer');
const logger = require('./middleware/logger');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ==========================================
// 🛡️ SECURITY & UTILITY MIDDLEWARES
// ==========================================

// Measure and expose X-Response-Time header on every response
app.use(requestTimer);

// Structured request/response logger (writes to src/logs/access.log)
app.use(logger);

// Set secure HTTP headers to mitigate XSS, clickjacking, etc.
app.use(helmet());

// Global rate limiter — 100 req/15 min per IP
app.use('/api', globalLimiter);

// Enable Cross-Origin Resource Sharing based on configuration origin rules
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Mount all API routes
app.use(`/api/${config.apiVersion}`, routes);

// Fallback Route Handler for 404 (Not Found) - passes error to global handler
app.use('*', (req, res, next) => {
  next(new AppError(`Resource not found: ${req.originalUrl}`, 404));
});

// ==========================================
// 🚨 GLOBAL ERROR HANDLER
// ==========================================
// Must be declared AFTER all routes and middleware
// Express identifies it as error middleware because it has 4 parameters: (err, req, res, next)
app.use(globalErrorHandler);

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

// ==========================================
// 💥 PROCESS-LEVEL EXCEPTION HANDLERS
// ==========================================

/**
 * uncaughtException — synchronous programming errors (e.g. undefined variable).
 * Must be set up BEFORE server starts to catch startup-phase errors.
 * The process MUST exit after an uncaught exception — the app state is unknown.
 */
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

/**
 * unhandledRejection — async errors where a Promise was rejected but no .catch() handled it.
 * e.g. a mongoose query that failed without a try/catch wrapper.
 * We close the server gracefully, then exit.
 */
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED PROMISE REJECTION! Shutting down...');
  console.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
