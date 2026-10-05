const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/chat/sessions
 * @desc Get all chat sessions for the current user
 * @access Private
 */
router.get('/sessions', chatController.getSessions);

/**
 * @route POST /api/chat/sessions
 * @desc Create a new chat session
 * @access Private
 */
router.post(
  '/sessions',
  [
    body('title').optional(),
    body('type').optional().isIn(['ai', 'human', 'student-counselor']).withMessage('Type must be ai, human, or student-counselor'),
    validateRequest
  ],
  chatController.createSession
);

/**
 * @route GET /api/chat/sessions/:id
 * @desc Get a chat session by ID
 * @access Private
 */
router.get('/sessions/:id', chatController.getSessionById);

/**
 * @route PUT /api/chat/sessions/:id
 * @desc Update a chat session
 * @access Private
 */
router.put(
  '/sessions/:id',
  [
    body('title').optional(),
    body('status').optional().isIn(['active', 'archived']),
    validateRequest
  ],
  chatController.updateSession
);

/**
 * @route DELETE /api/chat/sessions/:id
 * @desc Delete a chat session
 * @access Private
 */
router.delete('/sessions/:id', chatController.deleteSession);

/**
 * @route GET /api/chat/sessions/:id/messages
 * @desc Get all messages for a chat session
 * @access Private
 */
router.get('/sessions/:id/messages', chatController.getMessages);

/**
 * @route POST /api/chat/sessions/:id/messages
 * @desc Send a message in a chat session
 * @access Private
 */
router.post(
  '/sessions/:id/messages',
  [
    body('content').notEmpty().withMessage('Message content is required'),
    body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type'),
    validateRequest
  ],
  chatController.sendMessage
);

module.exports = router;