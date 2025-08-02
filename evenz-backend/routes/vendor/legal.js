// File:  routes/vendor/legal.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Legal = require('../../models/Vendor/legal');
const { protect } = require('../../middleware/vendor/auth');

const router = express.Router();

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// @route   GET /api/vendor/legal
// @desc    Get legal & payment info for vendor
// @access  Private (Vendor)
router.get('/', protect, async (req, res) => {
  try {
    let legal = await Legal.findOne({ vendor: req.vendor._id });

    if (!legal) {
      // Create default legal document if none exists
      legal = new Legal({
        vendor: req.vendor._id,
        acceptedPaymentModes: {
          upi: false,
          cash: false,
          card: false,
          netBanking: false,
          wallet: false
        },
        bookingAdvance: {
          type: 'percentage',
          value: 0
        },
        minimumNoticeDays: 1
      });
      await legal.save();
    }

    res.json({
      success: true,
      message: 'Legal & payment information retrieved successfully',
      data: legal
    });
  } catch (error) {
    console.error('Error fetching legal info:', error);
    res.status(500).json({ message: 'Server error while fetching legal information' });
  }
});

// @route   PUT /api/vendor/legal
// @desc    Update legal & payment info
// @access  Private (Vendor)
router.put('/',
  protect,
  [ // ADDED: Validation and Sanitization
    body('gstRegistrationNumber')
      .optional({ checkFalsy: true }) // Allows empty strings
      .isAlphanumeric().withMessage('GST number must be alphanumeric.')
      .isLength({ min: 15, max: 15 }).withMessage('GST number must be 15 characters.')
      .trim().escape(),
    body('cancellationRefundPolicy')
      .optional()
      .matches(safeTextRegex).withMessage('Invalid characters in cancellation policy.')
      .trim().escape(),
    body('minGuests').optional().isInt({ min: 1 }).withMessage('Minimum guests must be a positive number.'),
    body('maxGuests').optional().isInt({ min: 1 }).withMessage('Maximum guests must be a positive number.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const {
        gstRegistrationNumber,
        acceptedPaymentModes,
        bookingAdvance,
        minGuests,
        maxGuests,
        minimumNoticeDays,
        cancellationRefundPolicy
      } = req.body;

      // Validation
      if (bookingAdvance?.value < 0) {
        return res.status(400).json({ message: 'Booking advance value cannot be negative' });
      }

      if (minGuests && maxGuests && minGuests > maxGuests) {
        return res.status(400).json({ message: 'Minimum guests cannot be greater than maximum guests' });
      }

      let legal = await Legal.findOne({ vendor: req.vendor._id });

      if (!legal) {
        legal = new Legal({ vendor: req.vendor._id });
      }

      // Update fields
      if (gstRegistrationNumber !== undefined) legal.gstRegistrationNumber = gstRegistrationNumber;
      if (acceptedPaymentModes) legal.acceptedPaymentModes = acceptedPaymentModes;
      if (bookingAdvance) legal.bookingAdvance = bookingAdvance;
      if (minGuests !== undefined) legal.minGuests = minGuests;
      if (maxGuests !== undefined) legal.maxGuests = maxGuests;
      if (minimumNoticeDays !== undefined) legal.minimumNoticeDays = minimumNoticeDays;
      if (cancellationRefundPolicy !== undefined) legal.cancellationRefundPolicy = cancellationRefundPolicy;

      await legal.save();

      res.json({
        success: true,
        message: 'Legal & payment information updated successfully',
        legal
      });
    } catch (error) {
      console.error('Error updating legal info:', error);
      res.status(500).json({ message: 'Server error while updating legal information' });
    }
  });

module.exports = router;