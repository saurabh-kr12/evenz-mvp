// routes/userAuth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User/User');
const bcrypt = require('bcrypt');
const OTPService = require('../../services/otpService');
const EmailService = require('../../services/emailService');
const { protect } = require('../../middleware/user/auth');

const router = express.Router();

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

    console.log('=== verify-otp endpoint ===');
    console.log('mobile:', mobile);
    console.log('otp:', otp);
    console.log('otp type:', typeof otp);

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

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, otp, agreeToTerms } = req.body;

    console.log('=== register endpoint ===');
    console.log('mobile:', mobile);
    console.log('otp:', otp);
    console.log('otp type:', typeof otp);

    // Validate required fields
    if (!name || !email || !mobile || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the Terms and Conditions and Privacy Policy'
      });
    }

    const purpose = 'client_mobile_registration';

    // Verify OTP and mark as verified
    const otpResult = await OTPService.verifyOTP(mobile, otp, purpose, true);
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or mobile number'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      isMobileVerified: true,
      role: 'client',
      agreeToTerms: true,
      termsAcceptedAt: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        agreeToTerms: user.agreeToTerms,
        termsAcceptedAt: user.termsAcceptedAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { mobile, password, rememberMe } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this mobile number, please sign up first.'
      });
    }

    if (!user || !user.isMobileVerified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const expiresIn = rememberMe ? '60d' : '7d';
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Save remember token if rememberMe is true
    if (rememberMe) {
      user.rememberToken = token;
      user.rememberTokenExpires = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
      await user.save();
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
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
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
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

    console.log("user Id at route ",userId)
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

    console.log("user Id at route at update-mobile route :",userId)

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

    console.log("user Id at route at update-password route :",userId)

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

    console.log("user Id at route at send-email-otp route:", userId);

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
    
    // Debug logging - check what's available in req
    console.log('=== UPDATE EMAIL DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.userId:', req.userId);
    console.log('req.user._id:', req.user?._id);
    console.log('req.user.id:', req.user?.id);
    console.log('req.user.role:', req.user?.role);
    console.log('email:', email);
    console.log('otp:', otp);

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
    
    console.log('Using purpose:', purpose);

    // Verify email OTP
    const verification = await EmailService.verifyEmailOTP(email.toLowerCase(), otp, purpose);
    console.log('Verification result:', verification);
    
    if (!verification.success) {
      return res.status(400).json({ message: verification.message });
    }

    // Ensure the OTP belongs to the requesting user
    console.log('Comparing userId:', userId, 'with verification.userId:', verification.userId);
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

    console.log('Email updated successfully for user:', updatedUser._id);

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
    console.log('Me route hit!', req.headers.authorization);
    console.log('req.user:', req.user);

    // Get user ID from req.user (handle different structures)
    const userId = req.user.userId || req.user._id || req.user.id;

    console.log('User ID from req.user:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log('User not found in database with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found in database:', user.name, user.email);

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

// Logout (clear remember token)
router.post('/logout', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.rememberToken = undefined;
      user.rememberTokenExpires = undefined;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;