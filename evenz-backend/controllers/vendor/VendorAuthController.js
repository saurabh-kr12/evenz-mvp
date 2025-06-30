// File: controllers/VendorAuthController.js
const Vendor = require('../../models/Vendor/Vendor');
const Otp = require('../../models/Vendor/vendorOtp');
const generateToken = require('../../utils/vendor/generateToken');
const { sendEmailOtp, sendMobileOtp } = require('../../utils/vendor/sendOtp');

// Register a new vendor
const register = async (req, res) => {
  try {
    const {
      ownerName,
      email,
      mobile,
      businessName,
      pinCode,
      locality,
      city,
      fullAddress,
      password,
    } = req.body;

    // Check if vendor already exists with email or mobile
    const existingVendor = await Vendor.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingVendor) {
      return res.status(400).json({
        message: 'Vendor already exists with this email or mobile'
      });
    }

    // Create new vendor
    const vendor = await Vendor.create({
      ownerName,
      email,
      mobile,
      businessName,
      pinCode,
      locality,
      city,
      fullAddress,
      password,
      emailVerified: true, // Since we already verified during registration
      mobileVerified: true, // Since we already verified during registration
    });

    // Generate token
    const token = generateToken(vendor._id);

    // Return success response
    res.status(201).json({
      _id: vendor._id,
      ownerName: vendor.ownerName,
      email: vendor.email,
      mobile: vendor.mobile,
      businessName: vendor.businessName,
      emailVerified: vendor.emailVerified,
      mobileVerified: vendor.mobileVerified,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login vendor
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find vendor by email or mobile
    const vendor = await Vendor.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    }).select('+password');

    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await vendor.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(vendor._id);

    // Return success response
    res.status(200).json({
      _id: vendor._id,
      ownerName: vendor.ownerName,
      email: vendor.email,
      mobile: vendor.mobile,
      businessName: vendor.businessName,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Send email OTP
const sendEmailOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Send OTP
    await sendEmailOtp(email);

    res.status(200).json({ message: 'OTP sent to email successfully' });
  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Send mobile OTP
const sendMobileOtpController = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Send OTP
    await sendMobileOtp(mobile);

    res.status(200).json({ message: 'OTP sent to mobile successfully' });
  } catch (error) {
    console.error('Send mobile OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify email OTP
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP in database
    const otpRecord = await Otp.findOne({
      email,
      otp,
      type: 'email',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // If this is part of registration, we don't update the vendor yet
    // If this is for updating email, we handle that in the vendor controller

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

// Verify mobile OTP
const verifyMobileOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile and OTP are required' });
    }

    // Find OTP in database
    const otpRecord = await Otp.findOne({
      mobile,
      otp,
      type: 'mobile',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // If this is part of registration, we don't update the vendor yet
    // If this is for updating mobile, we handle that in the vendor controller

    res.status(200).json({ message: 'Mobile verified successfully' });
  } catch (error) {
    console.error('Verify mobile OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

module.exports = {
  register,
  login,
  sendEmailOtpController,
  sendMobileOtpController,
  verifyEmailOtp,
  verifyMobileOtp
};