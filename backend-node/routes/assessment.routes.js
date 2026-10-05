const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/assessment.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/assessments - list current user's assessments
router.get('/', controller.getMyAssessments);

// POST /api/assessments - create assessment and update wellness
router.post(
  '/',
  [
    body('depressionScore').isNumeric(),
    body('anxietyScore').isNumeric(),
    body('stressScore').isNumeric(),
    body('wellnessScore').isNumeric(),
    validateRequest
  ],
  controller.createAssessment
);

module.exports = router;