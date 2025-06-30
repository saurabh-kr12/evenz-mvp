// server/controllers/authController.js
const User = require('../../models/User/User');
const { generateOTP, saveOTP, sendOTP, verifyOTP, isEmail } = require('../../utils/otp');
const { generateToken } = require('../../utils/auth');

// Request OTP
const requestOTP = async (req, res) => {
  try {
    const { identifier, purpose } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email or phone number is required' });
    }

    // Check if this is for an update (user must be logged in)
    let userId = null;
    if (purpose === 'email-update' || purpose === 'contact-update') {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      userId = req.user._id;
    }

    // Check if the identifier already exists for another user
    if (purpose === 'registration' || purpose === 'email-update' || purpose === 'contact-update') {
      const query = isEmail(identifier) ? { email: identifier } : { contact: identifier };
      
      // If updating, exclude the current user
      if (userId) {
        query._id = { $ne: userId };
      }
      
      const existingUser = await User.findOne(query);
      
      if (existingUser) {
        const field = isEmail(identifier) ? 'email' : 'phone number';
        return res.status(400).json({ success: false, message: `This ${field} is already registered` });
      }
    }

    // Generate and save OTP
    const otp = generateOTP();
    await saveOTP(identifier, otp, purpose, userId);

    // Send OTP via email or SMS
    await sendOTP(identifier, otp);

    res.status(200).json({ 
      success: true, 
      message: `OTP sent to your ${isEmail(identifier) ? 'email' : 'phone'}`
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOTPHandler = async (req, res) => {
  try {
    const { identifier, otp, purpose } = req.body;
    
    if (!identifier || !otp || !purpose) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const result = await verifyOTP(identifier, otp, purpose);
    
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify OTP' });
  }
};

// Register user
const register = async (req, res) => {
  try {
    const { name, identifier, password, otp } = req.body;
    
    if (!name || !identifier || !password || !otp) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Verify the OTP first
    const otpVerification = await verifyOTP(identifier, otp, 'registration');
    
    if (!otpVerification.valid) {
      return res.status(400).json({ success: false, message: otpVerification.message });
    }

    // Determine if identifier is email or phone
    const userData = {
      name,
      password
    };

    if (isEmail(identifier)) {
      userData.email = identifier;
    } else {
      userData.contact = identifier;
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Find user by email or contact
    const query = isEmail(identifier) ? { email: identifier } : { contact: identifier };
    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get user profile' });
  }
};

// Update email
const updateEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Verify the OTP first
    const otpVerification = await verifyOTP(email, otp, 'email-update');
    
    if (!otpVerification.valid) {
      return res.status(400).json({ success: false, message: otpVerification.message });
    }

    // Check if email is already used by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already registered' });
    }

    // Update user email
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Email updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact
      }
    });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update email' });
  }
};

// Update contact
const updateContact = async (req, res) => {
  try {
    const { contact, otp } = req.body;
    
    if (!contact || !otp) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Verify the OTP first
    const otpVerification = await verifyOTP(contact, otp, 'contact-update');
    
    if (!otpVerification.valid) {
      return res.status(400).json({ success: false, message: otpVerification.message });
    }

    // Check if contact is already used by another user
    const existingUser = await User.findOne({ contact, _id: { $ne: req.user._id } });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This phone number is already registered' });
    }

    // Update user contact
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { contact },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Phone number updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update phone number' });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Find user
    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update password' });
  }
};

module.exports = {
  requestOTP,
  verifyOTPHandler,
  register,
  login,
  getUserProfile,
  updateEmail,
  updateContact,
  updatePassword
};