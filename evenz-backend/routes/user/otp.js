// routes/otp.js
const express = require('express');
const router = express.Router();
const OTP = require('../../models/User/Otp');
const User = require('../../models/User/User');
const msg91Service = require('../../services/msg91Service');


// Send OTP
router.post('/send', async (req, res) => {
  try {
    const { phone, purpose } = req.body;

    // Validate input
    if (!phone || !purpose) {
      return res.status(400).json({ message: 'Phone number and purpose are required' });
    }

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    // Check if purpose is valid
    const validPurposes = ['registration', 'login', 'password_reset'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({ message: 'Invalid purpose' });
    }

    // For registration, check if user already exists
    if (purpose === 'registration') {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this phone number already exists' });
      }
    }

    // For login, check if user exists
    if (purpose === 'login') {
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ message: 'No account found with this phone number' });
      }
    }

    // Check for recent OTP requests (prevent spam)
    const recentOTP = await OTP.findOne({
      phone,
      purpose,
      createdAt: { $gte: new Date(Date.now() - 60000) } // Last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'OTP already sent. Please wait before requesting again.' 
      });
    }

    // Delete any existing OTP for this phone and purpose
    await OTP.deleteMany({ phone, purpose });

    // Generate OTP
    const otpCode = msg91Service.generateOTP();

    // Save OTP to database
    const otp = new OTP({
      phone,
      otp: otpCode,
      purpose
    });

    await otp.save();

    // Send OTP via MSG91
    const smsResult = await msg91Service.sendOTP(phone, otpCode, purpose);

    if (smsResult.success) {
      res.json({
        message: 'OTP sent successfully',
        expiresIn: 300 // 5 minutes
      });
    } else {
      // Delete the OTP if SMS failed
      await OTP.deleteOne({ _id: otp._id });
      res.status(500).json({ message: 'Failed to send OTP' });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { phone, otp, purpose } = req.body;

    // Validate input
    if (!phone || !otp || !purpose) {
      return res.status(400).json({ message: 'Phone, OTP, and purpose are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      phone,
      purpose,
      isVerified: false
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      const remainingAttempts = 3 - otpRecord.attempts;
      return res.status(400).json({ 
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
      });
    }

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    res.json({
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend OTP
router.post('/resend', async (req, res) => {
  try {
    const { phone, purpose } = req.body;

    // Validate input
    if (!phone || !purpose) {
      return res.status(400).json({ message: 'Phone number and purpose are required' });
    }

    // Check rate limiting - allow resend only after 30 seconds
    const recentOTP = await OTP.findOne({
      phone,
      purpose,
      createdAt: { $gte: new Date(Date.now() - 30000) } // Last 30 seconds
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait 30 seconds before requesting another OTP.' 
      });
    }

    // Delete existing OTP
    await OTP.deleteMany({ phone, purpose });

    // Generate new OTP
    const otpCode = msg91Service.generateOTP();

    // Save new OTP
    const otp = new OTP({
      phone,
      otp: otpCode,
      purpose
    });

    await otp.save();

    // Send OTP
    const smsResult = await msg91Service.sendOTP(phone, otpCode, purpose);

    if (smsResult.success) {
      res.json({
        message: 'OTP resent successfully',
        expiresIn: 300
      });
    } else {
      await OTP.deleteOne({ _id: otp._id });
      res.status(500).json({ message: 'Failed to resend OTP' });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;