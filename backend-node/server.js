const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const { setupWebsocket } = require('./websocket');
const { connectDB } = require('./config/database');
const { logger } = require('./utils/logger');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize WebSocket handlers
setupWebsocket(io);

// Start server first, then connect to MongoDB
server.listen(PORT, async () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}`);
  
  // Connect to MongoDB after server is started
  try {
    await connectDB();
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'development') {
      logger.error('Shutting down server due to database connection failure');
      server.close(() => process.exit(1));
    } else {
      logger.warn('Running in development mode without MongoDB connection. Some features will not work.');
    }
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  if (process.env.NODE_ENV !== 'development') {
    server.close(() => process.exit(1));
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  if (process.env.NODE_ENV !== 'development') {
    server.close(() => process.exit(1));
  }
});