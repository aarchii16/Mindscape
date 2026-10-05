const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/users/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route PUT /api/users/profile
 * @desc Update current user's profile
 * @access Private
 */
router.put(
  '/profile',
  [
    body('firstName').optional(),
    body('lastName').optional(),
    body('bio').optional(),
    body('preferences').optional().isObject(),
    validateRequest
  ],
  userController.updateProfile
);

/**
 * @route PUT /api/users/password
 * @desc Update current user's password
 * @access Private
 */
router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
    validateRequest
  ],
  userController.updatePassword
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID (limited info)
 * @access Private
 */
router.get('/:id', userController.getUserById);

/**
 * @route GET /api/users/counselors/all
 * @desc Get all counselors
 * @access Private
 */
router.get('/counselors/all', userController.getCounselors);

module.exports = router;