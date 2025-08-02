// routes/registration.js
const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/vendorRegistrationController');
const { registrationLimiter, otpLimiter } = require('../../middleware/rateLimiter');
const { body } = require('express-validator'); // ADD this

// Step 1: Personal Contact & Location
router.post('/step1',
    registrationLimiter,
    [ // ADD validation chain
        body('ownerName', 'Owner name is required').not().isEmpty().trim().escape(),
        body('emailAddress', 'Please provide a valid email').isEmail().normalizeEmail(),
        body('mobileNumber', 'Please provide a valid 10-digit mobile number').isMobilePhone('en-IN'),
        body('state', 'State is required').not().isEmpty(),
        body('city', 'City is required').not().isEmpty(),
    ],
    registrationController.step1);

// Step 2: Verification & Password Setup
router.post('/step2/verify',
    registrationLimiter,
    [ // ADD validation chain
        body('tempId', 'Session ID is required').not().isEmpty(),
        body('mobileOTP', 'Mobile OTP must be a 6-digit number').isLength({ min: 6, max: 6 }).isNumeric(),
        body('emailOTP', 'Email OTP must be a 6-digit number').isLength({ min: 6, max: 6 }).isNumeric(),
        body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    ],
    registrationController.step2Verify);

// Step 3: Business Details & Complete Registration
router.post('/step3/complete',
    registrationLimiter,
    [ // ADD validation chain
        body('tempId', 'Session ID is required').not().isEmpty(),
        body('businessName', 'Business name is required').not().isEmpty().trim().escape(),
        body('pincode', 'Pincode must be a 6-digit number').isLength({ min: 6, max: 6 }).isNumeric(),
        body('locality', 'Locality is required').not().isEmpty().trim().escape(),
        body('agreeToTerms', 'You must agree to the terms').equals('true'),
    ],
    registrationController.step3Complete);

// Resend OTP endpoints with validation
router.post('/resend/mobile-otp', otpLimiter, [body('tempId').not().isEmpty()], registrationController.resendMobileOTP);
router.post('/resend/email-otp', otpLimiter, [body('tempId').not().isEmpty()], registrationController.resendEmailOTP);

// Location endpoints
router.get('/states', registrationController.getStates);
router.get('/cities/:state', registrationController.getCitiesByState);

module.exports = router;