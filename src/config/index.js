const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error && process.env.NODE_ENV !== 'production') {
  console.warn(`⚠️ Warning: Could not find a .env file at ${envPath}. Defaulting to system environment variables.`);
}

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

// Validate presence of required environment variables
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Critical Error: Environment variable '${key}' is missing!`);
    process.exit(1);
  }
});

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 2525,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'no-reply@globalearthquakeanalytics.com',
    fromName: process.env.FROM_NAME || 'Global Earthquake Analytics'
  },
  logLevel: process.env.LOG_LEVEL || 'info'
};
