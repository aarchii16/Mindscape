const jwt = require('jsonwebtoken');
const { logger } = require('./utils/logger');

// Import User model with error handling
let User;
try {
  User = require('./models/user.model');
} catch (error) {
  logger.warn('User model not available, WebSocket authentication will use mock data');
}

/**
 * Setup WebSocket with Socket.io
 * @param {Object} io - Socket.io instance
 */
exports.setupWebsocket = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      // In development mode without MongoDB, allow connection without authentication
      if (process.env.NODE_ENV === 'development' && !User) {
        socket.user = {
          id: 'dev-user-id',
          firstName: 'Development',
          lastName: 'User',
          email: 'dev@example.com',
          isAdmin: true
        };
        return next();
      }

      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id}`);
    
    // Join user to their own room for private messages
    socket.join(`user:${socket.user.id}`);
    
    // Chat message event
    socket.on('chat:message', async (data) => {
      try {
        const { sessionId, message, type = 'text' } = data;
        
        // In a real implementation, this would save the message to the database
        
        // Emit message to the session room
        io.to(`chat:${sessionId}`).emit('chat:message', {
          id: 'message-id-placeholder',
          sessionId,
          sender: {
            id: socket.user.id,
            name: `${socket.user.firstName} ${socket.user.lastName}`
          },
          content: message,
          type,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Error handling chat message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });
    
    // Chat typing event
    socket.on('chat:typing', (data) => {
      const { sessionId, isTyping } = data;
      
      // Broadcast typing status to the session room (except sender)
      socket.to(`chat:${sessionId}`).emit('chat:typing', {
        sessionId,
        user: {
          id: socket.user.id,
          name: `${socket.user.firstName} ${socket.user.lastName}`
        },
        isTyping
      });
    });
    
    // Join chat session
    socket.on('chat:join', (data) => {
      const { sessionId } = data;
      
      // Join the session room
      socket.join(`chat:${sessionId}`);
      logger.info(`User ${socket.user.id} joined chat session ${sessionId}`);
      
      // Notify others in the session
      socket.to(`chat:${sessionId}`).emit('chat:user-joined', {
        sessionId,
        user: {
          id: socket.user.id,
          name: `${socket.user.firstName} ${socket.user.lastName}`
        }
      });
    });
    
    // Leave chat session
    socket.on('chat:leave', (data) => {
      const { sessionId } = data;
      
      // Leave the session room
      socket.leave(`chat:${sessionId}`);
      logger.info(`User ${socket.user.id} left chat session ${sessionId}`);
      
      // Notify others in the session
      socket.to(`chat:${sessionId}`).emit('chat:user-left', {
        sessionId,
        user: {
          id: socket.user.id,
          name: `${socket.user.firstName} ${socket.user.lastName}`
        }
      });
    });
    
    // Disconnect event
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id}`);
    });
  });
  
  logger.info('WebSocket server initialized');
};