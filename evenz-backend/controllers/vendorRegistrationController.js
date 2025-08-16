// controllers/registrationController.js 
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor/Vendor');
const TempRegistration = require('../models/TempRegistration');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const locationService = require('../services/locationService');

class RegistrationController {
  // Step 1: Save Business & Location Details
  async step1(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
      const { ownerName, businessName, state, city, pincode, locality } = req.body;

      // Generate a temporary ID for this registration session
      const tempId = new mongoose.Types.ObjectId().toString();

      const tempRegistration = new TempRegistration({
        tempId, ownerName, businessName, state, city, pincode, locality,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
      });
      await tempRegistration.save();

      res.status(200).json({ success: true, tempId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
  }

  // Send OTP for either mobile or email
  async sendOTP(req, res) {
    const { tempId, type, value } = req.body; // type will be 'mobile' or 'email'
    try {
      const tempData = await TempRegistration.findOne({ tempId });
      if (!tempData) return res.status(400).json({ success: false, message: 'Invalid session.' });

      // Check if email/mobile is already registered
      const query = type === 'mobile' ? { mobile: value } : { email: value };
      const existingVendor = await Vendor.findOne(query);
      if (existingVendor) return res.status(400).json({ success: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} is already registered.` });

      if (type === 'mobile') {
        await otpService.sendOTP(value, 'vendor_mobile_registration');
        tempData.mobileNumber = value;
      } else if (type === 'email') {
        await emailService.sendEmailOTP(value, 'vendor_email_registration', null, tempData.ownerName);
        tempData.emailAddress = value;
      }
      await tempData.save();

      res.status(200).json({ success: true, message: `OTP sent to your ${type} successfully.` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to send OTP.' });
    }
  }

  // Verify OTP for either mobile or email
  async verifyOTP(req, res) {
    const { tempId, type, otp } = req.body;
    try {
      const tempData = await TempRegistration.findOne({ tempId });
      if (!tempData) return res.status(400).json({ success: false, message: 'Invalid session.' });

      const identifier = type === 'mobile' ? tempData.mobileNumber : tempData.emailAddress;
      const purpose = type === 'mobile' ? 'vendor_mobile_registration' : 'vendor_email_registration';

      const verificationResult = await otpService.verifyOTP(identifier, otp, purpose);
      if (!verificationResult.success) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
      }

      if (type === 'mobile') tempData.mobileVerified = true;
      if (type === 'email') tempData.emailVerified = true;
      await tempData.save();

      res.status(200).json({ success: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully.` });
    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred during verification.' });
    }
  }

  // Final step: Complete Registration
  async completeRegistration(req, res) {
    const { tempId, password, agreeToTerms } = req.body;
    try {
      const tempData = await TempRegistration.findOne({ tempId });
      if (!tempData || !tempData.mobileVerified || !tempData.emailVerified) {
        return res.status(400).json({ success: false, message: 'Please complete all verification steps.' });
      }
      if (!agreeToTerms) {
        return res.status(400).json({ success: false, message: 'You must agree to the terms and conditions.' });
      }

      // --- THE FIX IS HERE ---
      // The new Vendor object now correctly reads all details from the tempData document.
      const vendor = new Vendor({
        ownerName: tempData.ownerName,
        businessName: tempData.businessName,
        state: tempData.state,
        city: tempData.city,
        pinCode: tempData.pincode, // Corrected from pinCode to pincode
        locality: tempData.locality,
        mobile: tempData.mobileNumber,
        email: tempData.emailAddress,
        password: password,
        mobileVerified: true,
        emailVerified: true,
        isRegistered: true,
        termsAccepted: true,
        termsAcceptedAt: new Date()
      });
      await vendor.save();

      // Generate tokens for auto-login
      const accessToken = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: vendor._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '60d' });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 60 * 24 * 60 * 60 * 1000
      });

      await TempRegistration.findByIdAndDelete(tempData._id);

      res.status(201).json({
        success: true,
        message: 'Registration successful!',
        accessToken,
        vendor: { _id: vendor._id, businessName: vendor.businessName }
      });
    } catch (error) {
      console.error("Error in completeRegistration:", error);
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'This email or mobile number is already registered.' });
      }
      res.status(500).json({ success: false, message: 'An error occurred during registration.' });
    }
  }

  // Get states
  async getStates(req, res) {
    try {
      const result = await locationService.getStates();

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Get states error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch states'
      });
    }
  }

  // Get cities by state
  async getCitiesByState(req, res) {
    try {
      const { state } = req.params;

      if (!state) {
        return res.status(400).json({
          success: false,
          error: 'State parameter is required'
        });
      }

      const result = await locationService.getCitiesByState(state);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Get cities error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cities'
      });
    }
  }

  // Optional: Cleanup expired temp registrations manually
  async cleanupExpiredRegistrations() {
    try {
      const result = await TempRegistration.deleteMany({
        expiresAt: { $lt: new Date() }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new RegistrationController();