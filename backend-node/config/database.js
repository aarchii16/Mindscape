const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mindscape');
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    
    // In development mode, continue without exiting
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Running in development mode without MongoDB connection. Some features will not work.');
      return null;
    } else {
      // In production, exit the process
      process.exit(1);
    }
  }
};

module.exports = { connectDB };