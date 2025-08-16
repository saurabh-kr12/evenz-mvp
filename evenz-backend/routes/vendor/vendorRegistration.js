// File: routes/vendor/registration.js
const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/vendorRegistrationController');
const { registrationLimiter, otpLimiter } = require('../../middleware/rateLimiter');
const { body } = require('express-validator');

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// Step 1: Save Business & Location Details
router.post('/step1',
    registrationLimiter,
    [
        body('ownerName').not().isEmpty().withMessage('Owner name is required').matches(safeTextRegex).trim().escape(),
        body('businessName').not().isEmpty().withMessage('Business name is required').matches(safeTextRegex).trim().escape(),
        body('state').not().isEmpty().withMessage('State is required').matches(safeTextRegex).trim().escape(),
        body('city').not().isEmpty().withMessage('City is required').matches(safeTextRegex).trim().escape(),
        body('pincode').isNumeric().isLength({ min: 6, max: 6 }).withMessage('A valid 6-digit pincode is required.'),
        body('locality').not().isEmpty().withMessage('Locality is required').matches(safeTextRegex).trim().escape(),
    ],
    registrationController.step1);

// Step 2 endpoints
router.post('/otp/send', otpLimiter, registrationController.sendOTP);
router.post('/otp/verify', otpLimiter, registrationController.verifyOTP);
router.post('/complete', registrationLimiter, registrationController.completeRegistration);


// Location endpoints (no changes needed here)
router.get('/states', registrationController.getStates);
router.get('/cities/:state', registrationController.getCitiesByState);

module.exports = router;
