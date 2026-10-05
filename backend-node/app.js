const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
const requestId = require('./middleware/requestId');
app.use(requestId);
// Include request id in logs
morgan.token('id', (req) => req.id || '-');
app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());
require('./config/passport');

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/booking', require('./routes/booking.routes'));
app.use('/api/resources', require('./routes/resource.routes'));
app.use('/api/forum', require('./routes/forum.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/assessments', require('./routes/assessment.routes'));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'mindscape-backend',
    message: 'Welcome to Mindscape API',
    docs: '/api/*',
    health: '/health',
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;