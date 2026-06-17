/**
 * requestTimer middleware
 *
 * Measures the time taken to process each request and exposes it via:
 *  - X-Response-Time response header  (e.g.  "42ms")
 *  - req.startTime — for downstream loggers that need the raw Date
 */
const requestTimer = (req, res, next) => {
  req.startTime = Date.now();

  // Override res.end to inject header just before the response is flushed
  const originalEnd = res.end.bind(res);
  res.end = (...args) => {
    const duration = Date.now() - req.startTime;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    originalEnd(...args);
  };

  next();
};

module.exports = requestTimer;
