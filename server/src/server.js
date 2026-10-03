// Local / Docker entry point. (On Vercel the entry is /api/index.js.)
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const app = require('./app');

const REQUIRED_ENV = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }

  const server = app.listen(PORT, () =>
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  );

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
