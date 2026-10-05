const express = require('express');
const { query } = require('express-validator');
const analyticsController = require('../controllers/analytics.controller');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(isAdmin);

/**
 * @route GET /api/analytics/usage
 * @desc Get platform usage statistics
 * @access Admin
 */
router.get(
  '/usage',
  [
    query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isDate().withMessage('End date must be a valid date'),
    query('interval').optional().isIn(['day', 'week', 'month']).withMessage('Invalid interval'),
    validateRequest
  ],
  analyticsController.getUsageStats
);

/**
 * @route GET /api/analytics/users
 * @desc Get user statistics
 * @access Admin
 */
router.get(
  '/users',
  [
    query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isDate().withMessage('End date must be a valid date'),
    validateRequest
  ],
  analyticsController.getUserStats
);

/**
 * @route GET /api/analytics/engagement
 * @desc Get user engagement metrics
 * @access Admin
 */
router.get(
  '/engagement',
  [
    query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isDate().withMessage('End date must be a valid date'),
    validateRequest
  ],
  analyticsController.getEngagementMetrics
);

/**
 * @route GET /api/analytics/content
 * @desc Get content performance metrics
 * @access Admin
 */
router.get(
  '/content',
  [
    query('type').optional().isIn(['resources', 'forum', 'chat']).withMessage('Invalid content type'),
    query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isDate().withMessage('End date must be a valid date'),
    validateRequest
  ],
  analyticsController.getContentMetrics
);

/**
 * @route GET /api/analytics/sentiment
 * @desc Get sentiment analysis results
 * @access Admin
 */
router.get(
  '/sentiment',
  [
    query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isDate().withMessage('End date must be a valid date'),
    validateRequest
  ],
  analyticsController.getSentimentAnalysis
);

/**
 * @route GET /api/analytics/crisis
 * @desc Get crisis detection statistics
 * @access Admin
 */
router.get(
  '/crisis',
  [
    query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isDate().withMessage('End date must be a valid date'),
    validateRequest
  ],
  analyticsController.getCrisisStats
);

/**
 * @route GET /api/analytics/export
 * @desc Export analytics data
 * @access Admin
 */
router.get(
  '/export',
  [
    query('type').isIn(['users', 'usage', 'engagement', 'content', 'sentiment', 'crisis']).withMessage('Invalid export type'),
    query('format').isIn(['csv', 'json']).withMessage('Invalid export format'),
    query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isDate().withMessage('End date must be a valid date'),
    validateRequest
  ],
  analyticsController.exportData
);

module.exports = router;