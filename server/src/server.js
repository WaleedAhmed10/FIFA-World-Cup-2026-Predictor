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
  await connectDB();
  const server = app.listen(PORT, () => logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));

  // Fail loudly instead of leaving the process in a broken state.
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
