const express = require('express');
const { body, query } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const { isCounselor } = require('../middleware/isCounselor');
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/booking/slots
 * @desc Get available booking slots
 * @access Private
 */
router.get(
  '/slots',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    validateRequest
  ],
  bookingController.getAvailableSlots
);

/**
 * @route POST /api/booking/appointments
 * @desc Book a new appointment
 * @access Private
 */
router.post(
  '/appointments',
  [
    body('slotId').notEmpty().withMessage('Slot ID is required'),
    body('type').isIn(['therapy', 'coaching', 'consultation']).withMessage('Invalid appointment type'),
    body('notes').optional(),
    validateRequest
  ],
  bookingController.createAppointment
);

/**
 * @route GET /api/booking/appointments
 * @desc Get all appointments for the current user
 * @access Private
 */
router.get('/appointments', bookingController.getAppointments);

/**
 * @route GET /api/booking/appointments/:id
 * @desc Get an appointment by ID
 * @access Private
 */
router.get('/appointments/:id', bookingController.getAppointmentById);

/**
 * @route PUT /api/booking/appointments/:id
 * @desc Update an appointment
 * @access Private
 */
router.put(
  '/appointments/:id',
  [
    body('status').optional().isIn(['confirmed', 'cancelled', 'rescheduled']),
    body('notes').optional(),
    validateRequest
  ],
  bookingController.updateAppointment
);

/**
 * @route DELETE /api/booking/appointments/:id
 * @desc Cancel an appointment
 * @access Private
 */
router.delete('/appointments/:id', bookingController.cancelAppointment);

// Counselor routes

/**
 * @route POST /api/booking/slots
 * @desc Create a new slot
 * @access Private (Counselor only)
 */
router.post(
  '/slots',
  isCounselor,
  [
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO date'),
    body('endTime').isISO8601().withMessage('End time must be a valid ISO date'),
    body('type').isIn(['therapy', 'coaching', 'consultation']).withMessage('Invalid slot type'),
    body('notes').optional(),
    validateRequest
  ],
  bookingController.createSlot
);

/**
 * @route GET /api/booking/counselor/slots
 * @desc Get slots for the current counselor
 * @access Private (Counselor only)
 */
router.get(
  '/counselor/slots',
  isCounselor,
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    validateRequest
  ],
  bookingController.getMySlots
);

/**
 * @route GET /api/booking/counselor/appointments
 * @desc Get appointments for the current counselor
 * @access Private (Counselor only)
 */
router.get('/counselor/appointments', isCounselor, bookingController.getCounselorAppointments);

/**
 * @route GET /api/booking/counselor/stats
 * @desc Get statistics for the current counselor
 * @access Private (Counselor only)
 */
router.get('/counselor/stats', isCounselor, bookingController.getCounselorStats);

module.exports = router;