// // File: routes/vendor.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require('../../models/Vendor/Vendor');
const { body, validationResult } = require('express-validator');
const { protect } = require('../../middleware/vendor/auth');
const emailService = require('../../services/emailService');
const otpService = require('../../services/otpService');
const locationService = require('../../services/locationService');

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation. It blocks characters like < and >.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// @desc    Get vendor profile
// @route   GET /api/vendor-profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id).select('-password');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Add these headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update owner name
// @route   PUT /api/vendor-profile/owner-name
// @access  Private
router.put('/owner-name', protect,
  [ // ADDED: Validation and Sanitization
    body('ownerName')
      .not().isEmpty().withMessage('Owner name is required')
      .matches(safeTextRegex).withMessage('Owner name contains invalid characters.')
      .trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { ownerName } = req.body;

      if (!ownerName || ownerName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Owner name is required'
        });
      }

      const vendor = await Vendor.findByIdAndUpdate(
        req.vendor.id,
        { ownerName: ownerName.trim() },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Owner name updated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error updating owner name:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

// @desc    Update business name
// @route   PUT /api/vendor-profile/business-name
// @access  Private
router.put('/business-name', protect,
  [ // ADDED: Validation and Sanitization
    body('businessName')
      .not().isEmpty().withMessage('Business name is required')
      .matches(safeTextRegex).withMessage('Business name contains invalid characters.')
      .trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { businessName } = req.body;

      if (!businessName || businessName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Business name is required'
        });
      }

      const vendor = await Vendor.findByIdAndUpdate(
        req.vendor.id,
        { businessName: businessName.trim() },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Business name updated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error updating business name:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

// @desc    Update location (pincode, locality, city, state)
// @route   PUT /api/vendor-profile/location
// @access  Private
router.put('/location', protect,
  [ // ADDED: Validation and Sanitization
    body('pinCode').isNumeric().isLength({ min: 6, max: 6 }).withMessage('Invalid pin code.'),
    body('locality').matches(safeTextRegex).withMessage('Locality contains invalid characters.').trim().escape(),
    body('city').matches(safeTextRegex).withMessage('City contains invalid characters.').trim().escape(),
    body('state').matches(safeTextRegex).withMessage('State contains invalid characters.').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { pinCode, locality, city, state } = req.body;

      // Validate required fields
      if (!pinCode || !locality || !city || !state) {
        return res.status(400).json({
          success: false,
          message: 'All location fields are required'
        });
      }

      // Validate pincode format
      if (!/^[0-9]{6}$/.test(pinCode)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 6-digit pin code'
        });
      }

      const vendor = await Vendor.findByIdAndUpdate(
        req.vendor.id,
        {
          pinCode: pinCode.trim(),
          locality: locality.trim(),
          city: city.trim(),
          state: state.trim()
        },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

// @desc    Send OTP for mobile update
// @route   POST /api/vendor-profile/mobile/send-otp
// @access  Private
router.post('/mobile/send-otp',
  protect,
  [body('mobile').isMobilePhone('en-IN').withMessage('Invalid mobile number.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { mobile } = req.body;

      if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number'
        });
      }

      // Check if mobile is already in use by another vendor
      const existingVendor = await Vendor.findOne({
        mobile,
        _id: { $ne: req.vendor.id }
      });

      if (existingVendor) {
        return res.status(409).json({
          success: false,
          message: 'Mobile number is already registered with another account'
        });
      }

      // Check if it's the same mobile number
      if (req.vendor.mobile === mobile) {
        return res.status(400).json({
          success: false,
          message: 'This is your current mobile number'
        });
      }

      // Send OTP
      const result = await otpService.sendOTP(mobile, 'vendor_mobile_update', req.vendor.id);

      res.json({
        success: true,
        message: result.message,
        attemptsLeft: result.attemptsLeft
      });
    } catch (error) {
      console.error('Error sending mobile OTP:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP'
      });
    }
  });

// @desc    Verify OTP and update mobile
// @route   PUT /api/vendor-profile/mobile/verify-otp
// @access  Private
router.put('/mobile/verify-otp',
  protect,
  [
    body('mobile').isMobilePhone('en-IN').withMessage('Invalid mobile number.'),
    body('otp').isNumeric().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { mobile, otp } = req.body;

      if (!mobile || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number and OTP are required'
        });
      }

      // Verify OTP
      const otpResult = await otpService.verifyOTP(mobile, otp, 'vendor_mobile_update');

      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          message: otpResult.message
        });
      }

      // Update mobile number
      const vendor = await Vendor.findByIdAndUpdate(
        req.vendor.id,
        {
          mobile: mobile.trim(),
          mobileVerified: true
        },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Mobile number updated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error verifying mobile OTP:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify OTP'
      });
    }
  });

// @desc    Send OTP for email update
// @route   POST /api/vendor-profile/email/send-otp
// @access  Private
router.post('/email/send-otp',
  protect,
  [body('email').isEmail().withMessage('Invalid email address.').normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { email } = req.body;

      if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if email is already in use by another vendor
      const existingVendor = await Vendor.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.vendor.id }
      });

      if (existingVendor) {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered with another account'
        });
      }

      // Check if it's the same email
      if (req.vendor.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'This is your current email address'
        });
      }

      // Send OTP
      const result = await emailService.sendEmailOTP(
        email.toLowerCase(),
        'vendor_email_update',
        req.vendor.id,
        req.vendor.ownerName
      );

      res.json({
        success: true,
        message: result.message,
        attemptsLeft: result.attemptsLeft
      });
    } catch (error) {
      console.error('Error sending email OTP:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP'
      });
    }
  });

// @desc    Verify OTP and update email
// @route   PUT /api/vendor-profile/email/verify-otp
// @access  Private
router.put('/email/verify-otp',
  protect,
  [
    body('email').isEmail().withMessage('Invalid email address.').normalizeEmail(),
    body('otp').isNumeric().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }

      // Verify OTP
      const otpResult = await emailService.verifyEmailOTP(email.toLowerCase(), otp, 'vendor_email_update');

      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          message: otpResult.message
        });
      }

      // Update email
      const vendor = await Vendor.findByIdAndUpdate(
        req.vendor.id,
        {
          email: email.toLowerCase().trim(),
          emailVerified: true
        },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Email updated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify OTP'
      });
    }
  });

// @desc    Update password
// @route   PUT /api/vendor-profile/password
// @access  Private
router.put(
    '/password',
    protect,
    [
        body('currentPassword').not().isEmpty(),
        body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        try {
            const { currentPassword, newPassword } = req.body;
            const vendor = await Vendor.findById(req.vendor.id).select('+password');

            if (!vendor) {
                return res.status(404).json({ success: false, message: 'Vendor not found' });
            }

            const isMatch = await vendor.comparePassword(currentPassword);

            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }

            // Update password
            vendor.password = newPassword;
            await vendor.save();

            // --- THE FIX IS HERE ---
            // 1. Re-issue new tokens to keep the user logged in securely.
            const accessToken = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: vendor._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '60d' });

            // 2. Set the new refresh token in a secure cookie.
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
            });

            // 3. Send the new access token back to the frontend.
            res.json({
                success: true,
                message: 'Password updated successfully',
                accessToken // Send the new token
            });
            // --- END OF FIX ---

        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
);


// @desc    Get states
// @route   GET /api/vendor-profile/states
// @access  Private
router.get('/states', protect, async (req, res) => {
  try {
    const result = await locationService.getStates();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get cities by state
// @route   GET /api/vendor-profile/cities/:state
// @access  Private
router.get('/cities/:state', protect, async (req, res) => {
  try {
    const { state } = req.params;
    const result = await locationService.getCitiesByState(state);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if vendor exists
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Send OTP using email service
    const result = await emailService.sendEmailOTP(
      email.toLowerCase(),
      'vendor_password_reset',
      vendor._id,
      vendor.ownerName
    );

    res.status(200).json({
      message: 'OTP sent successfully to your email',
      attemptsLeft: result.attemptsLeft
    });

  } catch (error) {
    console.error('Password reset OTP error:', error);
    res.status(500).json({
      message: error.message || 'Failed to send password reset OTP'
    });
  }
});

router.post('/forgot-password/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check if vendor exists
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Verify OTP using email service
    const result = await emailService.verifyEmailOTP(
      email.toLowerCase(),
      otp,
      'vendor_password_reset'
    );

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({
      message: 'OTP verified successfully',
      email: result.email,
      verified: true
    });

  } catch (error) {
    console.error('Password reset OTP verification error:', error);
    res.status(500).json({
      message: error.message || 'Failed to verify OTP'
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if vendor exists
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update vendor password
    await Vendor.findByIdAndUpdate(vendor._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    res.status(200).json({
      message: 'Password reset successfully',
      success: true
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: error.message || 'Failed to reset password'
    });
  }
});

module.exports = router;