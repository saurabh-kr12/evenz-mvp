// controllers/registrationController.js 
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor/Vendor');
const TempRegistration = require('../models/TempRegistration');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const locationService = require('../services/locationService');

class RegistrationController {
  // Step 1: Personal Contact & Location

  async step1(req, res) {
    try {
      const { ownerName, mobileNumber, emailAddress, state, city } = req.body;

      // Validate required fields
      if (!ownerName || !mobileNumber || !emailAddress || !state || !city) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(emailAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address'
        });
      }

      // Validate mobile format
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobileNumber)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit mobile number'
        });
      }

      // Check if mobile or email already exists
      const existingVendor = await Vendor.findOne({
        $or: [
          { mobile: mobileNumber },
          { email: emailAddress }
        ]
      });

      if (existingVendor) {
        return res.status(400).json({
          success: false,
          error: 'Mobile number or email already registered'
        });
      }

      // Create or update temporary registration data
      const tempId = `${mobileNumber}_${Date.now()}`;

      // Remove any existing temp registration for this mobile/email
      await TempRegistration.deleteOne({
        $or: [
          { mobileNumber },
          { emailAddress }
        ]
      });

      const tempRegistration = new TempRegistration({
        tempId,
        ownerName,
        mobileNumber,
        emailAddress,
        state,
        city,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      });

      await tempRegistration.save();

      // Send OTPs
      const [mobileOtpResult, emailOtpResult] = await Promise.allSettled([
        otpService.sendOTP(mobileNumber, 'vendor_mobile_registration'),
        emailService.sendEmailOTP(emailAddress, 'vendor_email_registration', null, ownerName)
      ]);

      if (mobileOtpResult.status === 'rejected' && emailOtpResult.status === 'rejected') {
        return res.status(500).json({
          success: false,
          error: 'Failed to send OTPs. Please try again.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'OTPs sent successfully',
        tempId,
        mobileOtpSent: mobileOtpResult.status === 'fulfilled',
        emailOtpSent: emailOtpResult.status === 'fulfilled'
      });

    } catch (error) {
      console.error('Step 1 error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Step 2: Verification & Password Setup
  async step2Verify(req, res) {
    try {
      const { tempId, mobileOTP, emailOTP, password, confirmPassword } = req.body;

      // Validate required fields
      if (!tempId || !mobileOTP || !emailOTP || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // Check password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match'
        });
      }

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      // Get temporary registration data
      const tempData = await TempRegistration.findOne({ tempId });
      if (!tempData) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired registration session'
        });
      }

      // Verify OTPs
      const [mobileVerification, emailVerification] = await Promise.allSettled([
        otpService.verifyOTP(tempData.mobileNumber, mobileOTP, 'vendor_mobile_registration'),
        emailService.verifyEmailOTP(tempData.emailAddress, emailOTP, 'vendor_email_registration')
      ]);

      if (mobileVerification.status === 'rejected' || !mobileVerification.value.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile OTP'
        });
      }

      if (emailVerification.status === 'rejected' || !emailVerification.value.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email OTP'
        });
      }

      // Update temp data with password and verification status
      await TempRegistration.findByIdAndUpdate(tempData._id, {
        password,
        mobileVerified: true,
        emailVerified: true,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // Extend expiry
      });

      res.status(200).json({
        success: true,
        message: 'Verification successful, proceed to business details'
      });

    } catch (error) {
      console.error('Step 2 error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Step 3: Business Details & Complete Registration
  async step3Complete(req, res) {
    try {
      const { tempId, businessName, pincode, locality, agreeToTerms } = req.body;

      // Validate required fields
      if (!tempId || !businessName || !pincode || !locality) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // NEW VALIDATION: Check if user agreed to terms
      if (!agreeToTerms || agreeToTerms !== true) {
        return res.status(400).json({
          success: false,
          error: 'You must agree to the Terms & Conditions and Privacy Policy to complete registration'
        });
      }

      // Validate pincode format
      const pincodeRegex = /^[0-9]{6}$/;
      if (!pincodeRegex.test(pincode)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 6-digit pincode'
        });
      }

      // Get temporary registration data
      const tempData = await TempRegistration.findOne({ tempId });
      if (!tempData) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired registration session'
        });
      }

      // Verify that step 2 was completed
      if (!tempData.mobileVerified || !tempData.emailVerified) {
        return res.status(400).json({
          success: false,
          error: 'Please complete mobile and email verification first'
        });
      }

      // Create final vendor record
      const vendor = new Vendor({
        ownerName: tempData.ownerName,
        email: tempData.emailAddress,
        mobile: tempData.mobileNumber,
        state: tempData.state,
        city: tempData.city,
        businessName,
        pinCode: pincode,
        locality,
        password: tempData.password,
        mobileVerified: true,
        emailVerified: true,
        isRegistered: true,
        termsAccepted: true, // NEW FIELD: Track terms acceptance
        termsAcceptedAt: new Date() // NEW FIELD: Track when terms were accepted
      });

      await vendor.save();

      // Clean up temporary data
      await TempRegistration.findByIdAndDelete(tempData._id);

      // Remove password from response
      const vendorResponse = vendor.toObject();
      delete vendorResponse.password;

      res.status(201).json({
        success: true,
        message: 'Registration completed successfully',
        vendor: vendorResponse
      });

    } catch (error) {
      console.error('Step 3 error:', error);

      if (error.code === 11000) {
        // Duplicate key error
        return res.status(400).json({
          success: false,
          error: 'Mobile number or email already registered'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Resend OTP endpoints
  async resendMobileOTP(req, res) {
    try {
      const { tempId } = req.body;

      if (!tempId) {
        return res.status(400).json({
          success: false,
          error: 'tempId is required'
        });
      }

      const tempData = await TempRegistration.findOne({ tempId });
      if (!tempData) {
        return res.status(400).json({
          success: false,
          error: 'Registration session expired or invalid. Please start registration again.'
        });
      }

      const result = await otpService.sendOTP(tempData.mobileNumber, 'vendor_mobile_registration');

      res.status(200).json({
        success: true,
        message: 'Mobile OTP resent successfully',
        attemptsLeft: result.attemptsLeft
      });

    } catch (error) {
      console.error('Resend mobile OTP error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to resend mobile OTP'
      });
    }
  }

  async resendEmailOTP(req, res) {
    try {
      const { tempId } = req.body;

      if (!tempId) {
        return res.status(400).json({
          success: false,
          error: 'tempId is required'
        });
      }

      const tempData = await TempRegistration.findOne({ tempId });

      if (!tempData) {
        return res.status(400).json({
          success: false,
          error: 'Registration session expired or invalid. Please start registration again.'
        });
      }

      const result = await emailService.sendEmailOTP(
        tempData.emailAddress,
        'vendor_email_registration',
        null,
        tempData.ownerName
      );

      res.status(200).json({
        success: true,
        message: 'Email OTP resent successfully',
        attemptsLeft: result.attemptsLeft
      });

    } catch (error) {
      console.error('Resend email OTP error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to resend email OTP'
      });
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