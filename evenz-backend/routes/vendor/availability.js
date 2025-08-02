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

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// Apply vendor authentication to all routes
router.use(protect);

// Routes
router.get('/', getAvailability);
router.get('/summary', getAvailabilitySummary);
router.get('/:date', getDateAvailability);

router.post('/',
    [ // Combined and enhanced validation
        body('availability.*.notes')
            .optional()
            .isString()
            .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
            .matches(safeTextRegex).withMessage('Notes contain invalid characters.')
            .trim()
            .escape(), // Sanitize for XSS
        body('bulkUpdate.*.notes')
            .optional()
            .isString()
            .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
            .matches(safeTextRegex).withMessage('Notes contain invalid characters.')
            .trim()
            .escape(), // Sanitize for XSS
        body('bulkUpdate.*.date').optional().isISO8601().withMessage('Date must be in valid ISO format'),
        body('bulkUpdate.*.isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
    ],
    saveAvailability // The validationResult check is inside this controller
);

router.delete('/',
    [ // Validation for delete
        body('dates').optional().isArray().withMessage('Dates must be an array'),
        body('dates.*').optional().isISO8601().withMessage('Each date must be in valid ISO format')
    ],
    deleteAvailability
);

module.exports = router;