const rateLimit = require('express-rate-limit');

/**
 * Factory that creates a rate limiter with a custom error message.
 */
const createLimiter = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'fail',
      message
    }
  });

/**
 * General API limiter — 100 requests / 15 min per IP (global safety net).
 */
const globalLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) / 60000 || 15,
  parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  'Too many requests from this IP, please try again after 15 minutes.'
);

/**
 * Auth limiter — 20 requests / 15 min.
 * Protects login & register from brute-force attacks.
 */
const authLimiter = createLimiter(
  15,
  20,
  'Too many authentication attempts from this IP, please try again after 15 minutes.'
);

/**
 * Analytics limiter — 30 requests / 10 min.
 * Prevents excessive heavy aggregation queries.
 */
const analyticsLimiter = createLimiter(
  10,
  30,
  'Too many analytics requests from this IP, please try again after 10 minutes.'
);

/**
 * Search limiter — 60 requests / 10 min.
 */
const searchLimiter = createLimiter(
  10,
  60,
  'Too many search requests from this IP, please try again after 10 minutes.'
);

/**
 * Admin limiter — 50 requests / 10 min.
 * Tighter window for sensitive admin-only operations.
 */
const adminLimiter = createLimiter(
  10,
  50,
  'Too many admin requests from this IP, please try again after 10 minutes.'
);

module.exports = {
  globalLimiter,
  authLimiter,
  analyticsLimiter,
  searchLimiter,
  adminLimiter
};
