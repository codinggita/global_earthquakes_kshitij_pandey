const fs   = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFile = path.join(logsDir, 'access.log');

/**
 * Structured request/response logger middleware.
 *
 * Writes one JSON line per request to src/logs/access.log and also
 * emits a short summary to stdout (colourised in development).
 */
const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      ts:       new Date().toISOString(),
      method:   req.method,
      url:      req.originalUrl,
      status:   res.statusCode,
      duration: `${duration}ms`,
      ip:       req.ip || req.connection.remoteAddress,
      ua:       req.headers['user-agent'] || '-'
    };

    // Write to file (non-blocking)
    fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', () => {});

    // Colourised stdout summary in development
    if (process.env.NODE_ENV !== 'production') {
      const colour =
        res.statusCode >= 500 ? '\x1b[31m' :   // red
        res.statusCode >= 400 ? '\x1b[33m' :   // yellow
        res.statusCode >= 300 ? '\x1b[36m' :   // cyan
                                '\x1b[32m';    // green
      console.log(
        `${colour}[LOG] ${logEntry.ts} ${logEntry.method} ${logEntry.url} ${logEntry.status} ${logEntry.duration}\x1b[0m`
      );
    }
  });

  next();
};

module.exports = logger;
