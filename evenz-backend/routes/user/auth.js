// routes/userAuth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const OTPService = require('../../services/otpService');
const EmailService = require('../../services/emailService');
const { protect } = require('../../middleware/user/auth');

const router = express.Router();

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Check if mobile number is already registered
    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered. Please login with your existing account.',
        isRegistered: true
      });
    }

    // Determine purpose based on user role
    const purpose = 'client_mobile_registration';

    // Check if enough time has passed since last OTP
    const timeCheck = await OTPService.checkLastOTPTime(mobile);
    if (!timeCheck.canSend) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeCheck.waitTime} seconds before requesting another OTP`
      });
    }

    const result = await OTPService.sendOTP(mobile,purpose);

    res.json({
      success: true,
      message: result.message,
      attemptsLeft: result.attemptsLeft
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Verify OTP (this is just for checking, doesn't mark as verified)
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    const purpose = 'client_mobile_registration';

    // Use checkOTP instead of verifyOTP to avoid marking as verified
    const result = await OTPService.checkOTP(mobile, otp,purpose);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now proceed with registration.'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Register a new client user
// @route   POST /api/user/auth/register
router.post('/register', [
    body('name').matches(safeTextRegex).withMessage('Name contains invalid characters.').trim().escape(),
    body('email').isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
    body('mobile').isMobilePhone('en-IN').withMessage('Please provide a valid 10-digit mobile number.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('otp').isNumeric().isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit number.'),
    body('agreeToTerms').equals('true').withMessage('You must agree to the terms.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const { name, email, mobile, password, otp } = req.body;

        const otpResult = await OTPService.verifyOTP(mobile, otp, 'client_mobile_registration', true);
        if (!otpResult.success) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email or mobile number' });
        }

        const user = await User.create({
            name, email, mobile, password,
            isMobileVerified: true, role: 'client', agreeToTerms: true, termsAcceptedAt: new Date()
        });

        const expiresIn = '30d'; // New users get a long session by default
        const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn });

        res.cookie('clientRefreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            accessToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});

// @desc    Login a client user
// @route   POST /api/user/auth/login
router.post('/login', [
    body('mobile').isMobilePhone('en-IN').withMessage('Please enter a valid 10-digit mobile number.'),
    body('password').not().isEmpty().withMessage('Password is required.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const { mobile, password, rememberMe } = req.body;
        const user = await User.findOne({ mobile }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your mobile number and password.' });
        }

        const expiresIn = rememberMe ? '60d' : '7d';
        const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn });

        res.cookie('clientRefreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: (rememberMe ? 60 : 7) * 24 * 60 * 60 * 1000
        });
        
        res.json({
            success: true,
            message: 'Login successful',
            accessToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});

// @desc    Get a new access token for a client
// @route   GET /api/user/auth/refresh
router.get('/refresh', async (req, res) => {
    const refreshToken = req.cookies.clientRefreshToken;
    if (!refreshToken) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.sendStatus(403);

        const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ success: true, accessToken });
    } catch (err) {
        return res.sendStatus(403);
    }
});

// @desc    Logout a client user
// @route   POST /api/user/auth/logout
router.post('/logout', protect, async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.clientRefreshToken) return res.sendStatus(204);

    res.clearCookie('clientRefreshToken', { httpOnly: true, sameSite: 'none', secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true, message: 'Logout successful' });
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Find user
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const resetToken = EmailService.generateToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    await EmailService.sendPasswordResetEmail(email, resetToken, user.name);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.isEmailVerified = true; // Auto-verify email since they accessed reset link

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Your email has been verified.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password. Please try again.'
    });
  }
});

// Send OTP for mobile update
router.post('/send-mobile-otp', protect, async (req, res) => {
  try {
    const { mobile } = req.body;
    const userId = req.userId || req.user._id || req.user.id; // Ensure userId is correctly extracted

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Validate mobile format (basic validation)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    // Check if mobile is already registered by another user
    const existingUser = await User.findOne({
      mobile,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    // Determine purpose based on user role
    const purpose = req.user.role === 'client' ? 'client_mobile_update' : 'vendor_mobile_update';

    // Check if user can send OTP (2-minute cooldown)
    const lastOTPCheck = await OTPService.checkLastOTPTime(mobile, purpose);
    if (!lastOTPCheck.canSend) {
      return res.status(429).json({
        message: `Please wait ${lastOTPCheck.waitTime} seconds before requesting another OTP`,
        waitTime: lastOTPCheck.waitTime
      });
    }

    // Send OTP
    const result = await OTPService.sendOTP(mobile, purpose, userId);

    res.json({
      message: 'OTP sent successfully',
      attemptsLeft: result.attemptsLeft
    });

  } catch (error) {
    console.error('Send mobile OTP error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update mobile number
router.put('/update-mobile', protect, async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const userId = req.userId || req.user._id || req.user.id; // Ensure userId is correctly extracted

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    // Determine purpose based on user role
    const purpose = req.user.role === 'client' ? 'client_mobile_update' : 'vendor_mobile_update';

    // Verify OTP
    const otpVerification = await OTPService.verifyOTP(mobile, otp, purpose);
    if (!otpVerification.success) {
      return res.status(400).json({ message: otpVerification.message });
    }

    // Update user mobile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        mobile,
        isMobileVerified: true
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Mobile number updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update mobile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update password
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId ||  req.user._id || req.user.id; // Ensure userId is correctly extracted

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send email OTP for email update
router.post('/send-email-otp', protect, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.userId || req.user._id || req.user.id;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email is already registered by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Determine purpose based on user role
    const purpose = req.user.role === 'client' ? 'client_email_update' : 'vendor_email_update';

    // Send email OTP
    const result = await EmailService.sendEmailOTP(
      email.toLowerCase(),
      purpose,
      userId,
      req.user.name
    );

    res.json({
      message: 'OTP sent successfully to your email',
      attemptsLeft: result.attemptsLeft
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update email with OTP verification
// Update email with OTP verification
router.put('/update-email', protect, async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if user exists in request
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get userId with fallback
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email is already registered by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered by another user' });
    }

    // Determine purpose based on user role
    const purpose = req.user.role === 'client' ? 'client_email_update' : 'vendor_email_update';

    // Verify email OTP
    const verification = await EmailService.verifyEmailOTP(email.toLowerCase(), otp, purpose);
    
    if (!verification.success) {
      return res.status(400).json({ message: verification.message });
    }

    // Ensure the OTP belongs to the requesting user
    if (verification.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'OTP does not belong to the requesting user' });
    }

    // Update user email
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email: email.toLowerCase(),
        isEmailVerified: true
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Email updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get current user
// In your routes/user/auth.js file
router.get('/me', protect, async (req, res) => {
  try {
    // Get user ID from req.user (handle different structures)
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified
      }
    });

  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});


module.exports = router;