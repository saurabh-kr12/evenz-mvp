// File: routes/vendor/availabilityRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAvailability,
  getDateAvailability,
  saveAvailability,
  deleteAvailability,
  getAvailabilitySummary
} = require('../../controllers/vendor/calendarConrtroller');
const { protect } = require('../../middleware/vendor/auth');

// Validation middleware for single availability update
const validateAvailability = [
  body('availability')
    .optional()
    .isObject()
    .withMessage('Availability must be an object'),
  body('availability.*')
    .optional()
    .isObject()
    .withMessage('Each date entry must be an object'),
  body('availability.*.isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('availability.*.notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// Validation middleware for bulk update
const validateBulkUpdate = [
  body('bulkUpdate')
    .optional()
    .isArray()
    .withMessage('bulkUpdate must be an array'),
  body('bulkUpdate.*.date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  body('bulkUpdate.*.isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('bulkUpdate.*.notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// Validation middleware for date parameter
const validateDateParam = [
  body('dates')
    .optional()
    .isArray()
    .withMessage('Dates must be an array'),
  body('dates.*')
    .optional()
    .isISO8601()
    .withMessage('Each date must be in valid ISO format')
];

// Apply vendor authentication to all routes
router.use(protect);

// Routes
router.get('/', getAvailability);
router.get('/summary', getAvailabilitySummary);
router.get('/:date', getDateAvailability);
router.post('/', [...validateAvailability, ...validateBulkUpdate], saveAvailability);
router.delete('/', validateDateParam, deleteAvailability);

module.exports = router;