// 5. Registration Routes (routes/registration.js)
const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/vendorRegistrationController');
const { registrationLimiter, otpLimiter } = require('../../middleware/rateLimiter');

// Step 1: Personal Contact & Location
router.post('/step1', registrationLimiter, registrationController.step1);

// Step 2: Verification & Password Setup
router.post('/step2/verify', registrationLimiter, registrationController.step2Verify);

// Step 3: Business Details & Complete Registration
router.post('/step3/complete', registrationLimiter, registrationController.step3Complete);

// Resend OTP endpoints
router.post('/resend/mobile-otp', otpLimiter, registrationController.resendMobileOTP);
router.post('/resend/email-otp', otpLimiter, registrationController.resendEmailOTP);

// Location endpoints
router.get('/states', registrationController.getStates);
router.get('/cities/:state', registrationController.getCitiesByState);


module.exports = router;