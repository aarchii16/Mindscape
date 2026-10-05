const { createClient } = require('redis');
const { logger } = require('../utils/logger');

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis client connected');
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
    // Don't exit process, as Redis might be optional for some features
  }
};

// Handle Redis errors
redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

module.exports = { redisClient, connectRedis };