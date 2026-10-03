const mongoose = require('mongoose');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

// Cache the connection promise on the module so warm serverless invocations reuse it
// instead of opening a new connection on every request.
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // fail fast instead of hanging until the function times out
        maxPoolSize: 5
      })
      .then((m) => {
        logger.info(`MongoDB connected: ${m.connection.host}`);
        return m.connection;
      })
      .catch((err) => {
        connectionPromise = null; // allow retry on next request
        throw err;
      });
  }
  return connectionPromise;
};

module.exports = connectDB;
