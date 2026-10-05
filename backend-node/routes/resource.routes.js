const express = require('express');
const { body, query } = require('express-validator');
const resourceController = require('../controllers/resource.controller');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const router = express.Router();

// Public routes
/**
 * @route GET /api/resources
 * @desc Get all resources with optional filtering
 * @access Public
 */
router.get(
  '/',
  [
    query('category').optional(),
    query('tags').optional(),
    query('search').optional(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validateRequest
  ],
  resourceController.getResources
);

/**
 * @route GET /api/resources/:id
 * @desc Get a resource by ID
 * @access Public
 */
router.get('/:id', resourceController.getResourceById);

// Protected routes
router.use(authenticate);

/**
 * @route POST /api/resources/favorite/:id
 * @desc Add a resource to user's favorites
 * @access Private
 */
router.post('/favorite/:id', resourceController.addToFavorites);

/**
 * @route DELETE /api/resources/favorite/:id
 * @desc Remove a resource from user's favorites
 * @access Private
 */
router.delete('/favorite/:id', resourceController.removeFromFavorites);

/**
 * @route GET /api/resources/favorites
 * @desc Get user's favorite resources
 * @access Private
 */
router.get('/favorites', resourceController.getFavorites);

// Admin routes
router.use(isAdmin);

/**
 * @route POST /api/resources
 * @desc Create a new resource
 * @access Admin
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('tags').isArray().withMessage('Tags must be an array'),
    body('type').isIn(['article', 'video', 'audio', 'pdf']).withMessage('Invalid resource type'),
    validateRequest
  ],
  resourceController.createResource
);

/**
 * @route PUT /api/resources/:id
 * @desc Update a resource
 * @access Admin
 */
router.put(
  '/:id',
  [
    body('title').optional(),
    body('description').optional(),
    body('content').optional(),
    body('category').optional(),
    body('tags').optional().isArray(),
    body('type').optional().isIn(['article', 'video', 'audio', 'pdf']),
    validateRequest
  ],
  resourceController.updateResource
);

/**
 * @route DELETE /api/resources/:id
 * @desc Delete a resource
 * @access Admin
 */
router.delete('/:id', resourceController.deleteResource);

module.exports = router;