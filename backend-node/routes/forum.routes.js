const express = require('express');
const { body, query } = require('express-validator');
const forumController = require('../controllers/forum.controller');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/forum/topics
 * @desc Get all forum topics with optional filtering
 * @access Private
 */
router.get(
  '/topics',
  [
    query('category').optional(),
    query('tags').optional(),
    query('search').optional(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validateRequest
  ],
  forumController.getTopics
);

/**
 * @route POST /api/forum/topics
 * @desc Create a new forum topic
 * @access Private
 */
router.post(
  '/topics',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('tags').optional().isArray(),
    body('isAnonymous').optional().isBoolean(),
    validateRequest
  ],
  forumController.createTopic
);

// Like/Unlike a topic
router.post('/topics/:id/like', forumController.likeTopic);
router.post('/topics/:id/unlike', forumController.unlikeTopic);

/**
 * @route GET /api/forum/topics/:id
 * @desc Get a forum topic by ID
 * @access Private
 */
router.get('/topics/:id', forumController.getTopicById);

/**
 * @route PUT /api/forum/topics/:id
 * @desc Update a forum topic
 * @access Private (owner or admin)
 */
router.put(
  '/topics/:id',
  [
    body('title').optional(),
    body('content').optional(),
    body('category').optional(),
    body('tags').optional().isArray(),
    validateRequest
  ],
  forumController.updateTopic
);

/**
 * @route DELETE /api/forum/topics/:id
 * @desc Delete a forum topic
 * @access Private (owner or admin)
 */
router.delete('/topics/:id', forumController.deleteTopic);

/**
 * @route POST /api/forum/topics/:id/posts
 * @desc Create a new post in a topic
 * @access Private
 */
router.post(
  '/topics/:id/posts',
  [
    body('content').notEmpty().withMessage('Content is required'),
    validateRequest
  ],
  forumController.createPost
);

// Replies listing (posts for topic)
router.get('/topics/:id/posts', forumController.getPosts);

// Like/Unlike a reply (post)
router.post('/posts/:id/like', forumController.likePost);
router.post('/posts/:id/unlike', forumController.unlikePost);

/**
 * @route GET /api/forum/topics/:id/posts
 * @desc Get all posts for a topic
 * @access Private
 */
router.get('/topics/:id/posts', forumController.getPosts);

/**
 * @route PUT /api/forum/posts/:id
 * @desc Update a post
 * @access Private (owner or admin)
 */
router.put(
  '/posts/:id',
  [
    body('content').notEmpty().withMessage('Content is required'),
    validateRequest
  ],
  forumController.updatePost
);

/**
 * @route DELETE /api/forum/posts/:id
 * @desc Delete a post
 * @access Private (owner or admin)
 */
router.delete('/posts/:id', forumController.deletePost);

/**
 * @route POST /api/forum/posts/:id/like
 * @desc Like a post
 * @access Private
 */
router.post('/posts/:id/like', forumController.likePost);

/**
 * @route POST /api/forum/posts/:id/unlike
 * @desc Unlike a post
 * @access Private
 */
router.post('/posts/:id/unlike', forumController.unlikePost);

/**
 * @route POST /api/forum/posts/:id/report
 * @desc Report a post
 * @access Private
 */
router.post(
  '/posts/:id/report',
  [
    body('reason').notEmpty().withMessage('Reason is required'),
    validateRequest
  ],
  forumController.reportPost
);

// Admin routes
router.use(isAdmin);

/**
 * @route GET /api/forum/reports
 * @desc Get all reported posts
 * @access Admin
 */
router.get('/reports', forumController.getReports);

/**
 * @route PUT /api/forum/reports/:id
 * @desc Update a report status
 * @access Admin
 */
router.put(
  '/reports/:id',
  [
    body('status').isIn(['pending', 'reviewed', 'resolved']).withMessage('Invalid status'),
    body('action').optional().isIn(['none', 'hide', 'delete']).withMessage('Invalid action'),
    validateRequest
  ],
  forumController.updateReport
);

module.exports = router;