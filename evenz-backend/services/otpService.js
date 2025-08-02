// services/otpService.js
const axios = require('axios');
const OTP = require('../models/OTP');
const OTPRateLimit = require('../models/OTPRateLimit');


class OTPService {
  constructor() {
    this.fast2smsMessageId = process.env.FAST2SMS_MESSAGE_ID || '2395';
  }

  getFast2smsApiKey() {
    return process.env.FAST2SMS_API_KEY;
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async checkRateLimit(identifier, purpose) {
    const rateLimit = await OTPRateLimit.findOne({ identifier, purpose });

    if (!rateLimit) {
      return { allowed: true, attemptsLeft: 3 };
    }

    const now = new Date();

    // Reset if hour has passed
    if (now > rateLimit.resetTime) {
      rateLimit.attempts = 0;
      rateLimit.resetTime = new Date(now.getTime() + 60 * 60 * 1000);
      await rateLimit.save();
      return { allowed: true, attemptsLeft: 3 };
    }

    if (rateLimit.attempts >= 3) {
      const timeLeft = Math.ceil((rateLimit.resetTime - now) / 60000);
      return { 
        allowed: false, 
        attemptsLeft: 0,
        message: `Rate limit exceeded. Try again in ${timeLeft} minutes.`
      };
    }

    return { 
      allowed: true, 
      attemptsLeft: 3 - rateLimit.attempts 
    };
  }

  async incrementRateLimit(identifier, purpose) {
    const rateLimit = await OTPRateLimit.findOne({ identifier, purpose });

    if (!rateLimit) {
      await OTPRateLimit.create({
        identifier,
        purpose,
        attempts: 1,
        lastAttempt: new Date()
      });
    } else {
      rateLimit.attempts += 1;
      rateLimit.lastAttempt = new Date();
      await rateLimit.save();
    }
  }

  async sendOTP(identifier, purpose, userId) {
    try {
      const fast2smsApiKey = this.getFast2smsApiKey();

      if (!fast2smsApiKey) {
        throw new Error('Fast2SMS API key not configured properly - API key is missing');
      }

      if (fast2smsApiKey === 'xxx') {
        throw new Error('Fast2SMS API key not configured properly - API key is still "xxx"');
      }

      // Check rate limit
      const rateLimitCheck = await this.checkRateLimit(identifier, purpose);
      if (!rateLimitCheck.allowed) {
        throw new Error(rateLimitCheck.message);
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this identifier and purpose
      await OTP.deleteMany({ identifier, purpose, verified: false });

      // Save OTP to database
      const otpData = {
        identifier,
        otp,
        purpose,
        expiresAt,
        verified: false,
        type: 'mobile',
        createdAt: new Date()
      };

      if (userId) {
        otpData.userId = userId;
      }

      const otpRecord = await OTP.create(otpData);

      // Send OTP via Fast2SMS WhatsApp API
      const response = await axios.get('https://www.fast2sms.com/dev/whatsapp', {
        params: {
          authorization: fast2smsApiKey,
          message_id: this.fast2smsMessageId,
          numbers: identifier,
          variables_values: otp
        }
      });

      // Increment rate limit
      await this.incrementRateLimit(identifier, purpose);

      return {
        success: true,
        message: 'OTP sent successfully',
        attemptsLeft: rateLimitCheck.attemptsLeft - 1
      };

    } catch (error) {
      console.error('OTP sending error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
    }
  }

  async verifyOTP(identifier, otp, purpose, markAsVerified = true) {
    try {
      const otpString = otp.toString();

      const otpRecord = await OTP.findOne({ 
        identifier, 
        otp: otpString,
        purpose,
        verified: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpRecord) {
        console.log('OTP verification failed - no matching record found');
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Only mark as verified if requested
      if (markAsVerified) {
        otpRecord.verified = true;
        await otpRecord.save();
        console.log('OTP marked as verified');
      }

      // Clean up expired OTPs
      await OTP.deleteMany({ 
        identifier, 
        purpose,
        expiresAt: { $lt: new Date() }
      });

      return {
        success: true,
        message: 'OTP verified successfully'
      };

    } catch (error) {
      console.error('OTP verification error:', error);
      throw new Error('Failed to verify OTP');
    }
  }

  async checkOTP(identifier, otp, purpose) {
    return await this.verifyOTP(identifier, otp, purpose, false);
  }

  async checkLastOTPTime(identifier, purpose) {
    const lastOTP = await OTP.findOne({ identifier, purpose }).sort({ createdAt: -1 });

    if (!lastOTP) {
      return { canSend: true, waitTime: 0 };
    }

    const timeSinceLastOTP = Date.now() - lastOTP.createdAt.getTime();
    const waitTime = 2 * 60 * 1000; // 2 minutes

    if (timeSinceLastOTP < waitTime) {
      return {
        canSend: false,
        waitTime: Math.ceil((waitTime - timeSinceLastOTP) / 1000)
      };
    }

    return { canSend: true, waitTime: 0 };
  }
}

module.exports = new OTPService();