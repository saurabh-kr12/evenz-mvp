// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/user/auth');
const {
  requestOTP,
  verifyOTPHandler,
  register,
  login,
  getUserProfile,
  updateEmail,
  updateContact,
  updatePassword
} = require('../../controllers/user/authController');

// Public routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTPHandler);
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getUserProfile);
router.post('/update-email', protect, requestOTP); // First request OTP
router.put('/update-email', protect, updateEmail); // Then update email with OTP
router.post('/update-contact', protect, requestOTP); // First request OTP
router.put('/update-contact', protect, updateContact); // Then update contact with OTP
router.put('/update-password', protect, updatePassword);

module.exports = router;

// routes/auth.js
// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const OTP = require('../../models/User/Otp');
// const User = require('../../models/User/User');
// const { protect } = require('../../middleware/user/auth');
// const authMiddleware = require('../../middleware/user/auth');

// // Generate JWT token
// const generateToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
//     expiresIn: '30d'
//   });
// };

// // Register user
// router.post('/register', async (req, res) => {
//   try {
//     const { name, phone, password, otp } = req.body;

//     // Validate input
//     if (!name || !phone || !password || !otp) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Validate phone format
//     const phoneRegex = /^\+?[1-9]\d{9,14}$/;
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({ message: 'Please enter a valid phone number' });
//     }

//     // Validate password
//     if (password.length < 6) {
//       return res.status(400).json({ message: 'Password must be at least 6 characters long' });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ phone });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User with this phone number already exists' });
//     }

//     // Verify OTP
//     const otpRecord = await OTP.findOne({
//       phone,
//       otp,
//       purpose: 'registration',
//       isVerified: true,
//       expiresAt: { $gte: new Date() }
//     });

//     if (!otpRecord) {
//       return res.status(400).json({ message: 'Invalid or expired OTP. Please verify your phone number first.' });
//     }

//     // Create user
//     const user = new User({
//       name: name.trim(),
//       phone,
//       password,
//       isPhoneVerified: true
//     });

//     await user.save();

//     // Delete used OTP
//     await OTP.deleteOne({ _id: otpRecord._id });

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(201).json({
//       message: 'Registration successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         isPhoneVerified: user.isPhoneVerified,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({ message: 'Phone number already registered' });
//     }
    
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Login user
// router.post('/login', async (req, res) => {
//   try {
//     const { phone, password } = req.body;

//     // Validate input
//     if (!phone || !password) {
//       return res.status(400).json({ message: 'Phone number and password are required' });
//     }

//     // Find user
//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid phone number or password' });
//     }

//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ message: 'Invalid phone number or password' });
//     }

//     // Check if phone is verified
//     if (!user.isPhoneVerified) {
//       return res.status(400).json({ 
//         message: 'Phone number not verified. Please complete registration.',
//         requiresVerification: true
//       });
//     }

//     // Generate token
//     const token = generateToken(user._id);

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         isPhoneVerified: user.isPhoneVerified,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Get current user
// router.get('/me', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         isPhoneVerified: user.isPhoneVerified,
//         role: user.role,
//         profile: user.profile
//       }
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Update user profile
// router.put('/profile', protect, async (req, res) => {
//   try {
//     const { name, profile } = req.body;
    
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update fields
//     if (name) user.name = name.trim();
//     if (profile) {
//       user.profile = { ...user.profile, ...profile };
//     }

//     await user.save();

//     res.json({
//       message: 'Profile updated successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         isPhoneVerified: user.isPhoneVerified,
//         role: user.role,
//         profile: user.profile
//       }
//     });

//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Change password
// router.put('/change-password', protect, async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ message: 'Current password and new password are required' });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ message: 'New password must be at least 6 characters long' });
//     }

//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Verify current password
//     const isCurrentPasswordValid = await user.comparePassword(currentPassword);
//     if (!isCurrentPasswordValid) {
//       return res.status(400).json({ message: 'Current password is incorrect' });
//     }

//     // Update password
//     user.password = newPassword;
//     await user.save();

//     res.json({ message: 'Password changed successfully' });

//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Logout (client-side token removal, but we can log it)
// router.post('/logout', protect, async (req, res) => {
//   try {
//     // In a more sophisticated setup, you might want to blacklist the token
//     // For now, we'll just send a success response
//     res.json({ message: 'Logout successful' });
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// module.exports = router;