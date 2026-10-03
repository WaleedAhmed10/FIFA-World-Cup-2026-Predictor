// Vercel serverless entry point. Every /api/* request is rewritten here (see vercel.json).
const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

const send = (res, code, body) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const REQUIRED_ENV = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

module.exports = async (req, res) => {
  // Report a missing config clearly instead of crashing with an opaque 500.
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    return send(res, 500, { success: false, message: `Server misconfigured. Missing env vars: ${missing.join(', ')}` });
  }

  // Health check works even if the database is down.
  if (req.url.startsWith('/api/health')) return app(req, res);

  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return send(res, 503, { success: false, message: 'Database unavailable' });
  }
  return app(req, res);
};
