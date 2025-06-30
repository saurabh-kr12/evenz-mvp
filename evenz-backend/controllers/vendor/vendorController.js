// File: controllers/vendorController.js
const Vendor = require('../../models/Vendor/Vendor');
const bcrypt = require('bcryptjs');

// Get vendor profile
const getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.status(200).json({
      _id: vendor._id,
      ownerName: vendor.ownerName,
      email: vendor.email,
      mobile: vendor.mobile,
      businessName: vendor.businessName,
      pinCode: vendor.pinCode,
      locality: vendor.locality,
      city: vendor.city,
      fullAddress: vendor.fullAddress,
      emailVerified: vendor.emailVerified,
      mobileVerified: vendor.mobileVerified
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// Update email
const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if email is already in use by another vendor
    const existingVendor = await Vendor.findOne({ email, _id: { $ne: req.vendor._id } });
    
    if (existingVendor) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    
    // Update vendor email
    req.vendor.email = email;
    req.vendor.emailVerified = true;
    req.vendor.updatedAt = Date.now();
    
    await req.vendor.save();
    
    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ message: 'Failed to update email', error: error.message });
  }
};

// Update mobile
const updateMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }
    
    // Check if mobile is already in use by another vendor
    const existingVendor = await Vendor.findOne({ mobile, _id: { $ne: req.vendor._id } });
    
    if (existingVendor) {
      return res.status(400).json({ message: 'Mobile number is already in use' });
    }
    
    // Update vendor mobile
    req.vendor.mobile = mobile;
    req.vendor.mobileVerified = true;
    req.vendor.updatedAt = Date.now();
    
    await req.vendor.save();
    
    res.status(200).json({ message: 'Mobile number updated successfully' });
  } catch (error) {
    console.error('Update mobile error:', error);
    res.status(500).json({ message: 'Failed to update mobile number', error: error.message });
  }
};

// Update business details
const updateBusiness = async (req, res) => {
  try {
    const { businessName, ownerName } = req.body;
    
    if (!businessName || !ownerName) {
      return res.status(400).json({ message: 'Business name and owner name are required' });
    }
    
    // Update vendor business details
    req.vendor.businessName = businessName;
    req.vendor.ownerName = ownerName;
    req.vendor.updatedAt = Date.now();
    
    await req.vendor.save();
    
    res.status(200).json({ message: 'Business details updated successfully' });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ message: 'Failed to update business details', error: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { pinCode, locality, city, fullAddress } = req.body;
    
    if (!pinCode || !locality || !city) {
      return res.status(400).json({ message: 'Pin code, locality, and city are required' });
    }
    
    // Update vendor address
    req.vendor.pinCode = pinCode;
    req.vendor.locality = locality;
    req.vendor.city = city;
    req.vendor.fullAddress = fullAddress || req.vendor.fullAddress;
    req.vendor.updatedAt = Date.now();
    
    await req.vendor.save();
    
    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Failed to update address', error: error.message });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    // Get vendor with password
    const vendor = await Vendor.findById(req.vendor._id).select('+password');
    
    // Check if current password is correct
    const isMatch = await vendor.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    vendor.password = newPassword;
    vendor.updatedAt = Date.now();
    
    await vendor.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

module.exports = {
  getProfile,
  updateEmail,
  updateMobile,
  updateBusiness,
  updateAddress,
  updatePassword
};