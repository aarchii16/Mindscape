const express = require('express');
const { body } = require('express-validator');
const aiController = require('../controllers/ai.controller');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /api/ai/chat
 * @desc Send a message to the AI assistant
 * @access Private
 */
router.post(
  '/chat',
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('sessionId').optional(),
    validateRequest
  ],
  aiController.chatWithAI
);

/**
 * @route POST /api/ai/analyze
 * @desc Analyze text for sentiment and crisis detection
 * @access Private
 */
router.post(
  '/analyze',
  [
    body('text').notEmpty().withMessage('Text is required'),
    validateRequest
  ],
  aiController.analyzeText
);

/**
 * @route POST /api/ai/summarize
 * @desc Summarize a conversation or text
 * @access Private
 */
router.post(
  '/summarize',
  [
    body('text').notEmpty().withMessage('Text is required'),
    body('maxLength').optional().isInt({ min: 50, max: 500 }),
    validateRequest
  ],
  aiController.summarizeText
);

/**
 * @route POST /api/ai/resources
 * @desc Get AI-recommended resources based on user input
 * @access Private
 */
router.post(
  '/resources',
  [
    body('query').notEmpty().withMessage('Query is required'),
    body('limit').optional().isInt({ min: 1, max: 20 }),
    validateRequest
  ],
  aiController.getRecommendedResources
);

/**
 * @route POST /api/ai/exercises
 * @desc Get AI-generated mental health exercises
 * @access Private
 */
router.post(
  '/exercises',
  [
    body('type').isIn(['meditation', 'breathing', 'journaling', 'cognitive', 'general']).withMessage('Invalid exercise type'),
    body('duration').optional().isInt({ min: 1, max: 60 }),
    validateRequest
  ],
  aiController.generateExercises
);

/**
 * @route POST /api/ai/feedback
 * @desc Submit feedback on AI responses
 * @access Private
 */
router.post(
  '/feedback',
  [
    body('responseId').notEmpty().withMessage('Response ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').optional(),
    validateRequest
  ],
  aiController.submitFeedback
);

module.exports = router;