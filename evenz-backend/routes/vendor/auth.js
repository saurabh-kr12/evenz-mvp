// File: routes/auth.js
const express = require('express');
const {
  register,
  login,
  sendEmailOtpController,
  sendMobileOtpController,
  verifyEmailOtp,
  verifyMobileOtp
} = require('../../controllers/vendor/VendorAuthController');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// OTP routes
router.post('/send-email-otp', sendEmailOtpController);
router.post('/send-mobile-otp', sendMobileOtpController);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/verify-mobile-otp', verifyMobileOtp);

module.exports = router;