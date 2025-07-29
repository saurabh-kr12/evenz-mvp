// services/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const OTP = require('../models/OTP');
const OTPRateLimit = require('../models/OTPRateLimit');


class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('Missing required SMTP configuration in environment variables');
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.transporter.verify((error, success) => {
        if (error) {
          console.error('SMTP connection error:', error);
        } else {
          console.log('SMTP server is ready to take our messages');
        }
      });

    } catch (error) {
      console.error('Email service initialization error:', error);
      throw error;
    }
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
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

  async sendEmailOTP(email, purpose, userId, userName) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      console.log('=== sendEmailOTP Debug ===');
      console.log('email:', email);
      console.log('purpose:', purpose);
      console.log('userId:', userId);

      // Check rate limit
      const rateLimitCheck = await this.checkRateLimit(email, purpose);
      if (!rateLimitCheck.allowed) {
        throw new Error(rateLimitCheck.message);
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this email and purpose
      await OTP.deleteMany({ identifier: email, purpose, verified: false });

      // Save OTP to database
      const otpRecord = await OTP.create({
        identifier: email,
        otp: otp,
        purpose,
        userId,
        expiresAt,
        verified: false,
        type: 'email',
        createdAt: new Date()
      });

      console.log('Email OTP saved to database:', {
        email,
        purpose,
        otp,
        expiresAt,
        recordId: otpRecord._id
      });

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Evenz.in'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Email Verification OTP - Evenz.in',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #3B82F6; margin-bottom: 10px;">Email Verification</h2>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0; font-size: 16px;">Hello ${userName},</p>
              <p style="margin: 0 0 15px 0; font-size: 16px;">Please use the following OTP to verify your email address:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <div style="display: inline-block; background-color: #3B82F6; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; font-family: monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">
                This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Best regards,<br>
                <strong>Evenz.in Team</strong>
              </p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email OTP sent successfully:', info.messageId);

      // Increment rate limit
      await this.incrementRateLimit(email, purpose);

      return {
        success: true,
        message: 'OTP sent successfully to your email',
        attemptsLeft: rateLimitCheck.attemptsLeft - 1
      };

    } catch (error) {
      console.error('Error sending email OTP:', error);
      throw new Error(error.message || 'Failed to send email OTP');
    }
  }

  async verifyEmailOTP(email, otp, purpose) {
    try {
      console.log('=== verifyEmailOTP Debug ===');
      console.log('email:', email);
      console.log('otp:', otp);
      console.log('purpose:', purpose);

      const otpRecord = await OTP.findOne({ 
        identifier: email,
        otp: otp,
        purpose,
        verified: false,
        type: 'email',
        expiresAt: { $gt: new Date() }
      });

      console.log('Found email OTP record:', otpRecord ? {
        identifier: otpRecord.identifier,
        purpose: otpRecord.purpose,
        verified: otpRecord.verified,
        expiresAt: otpRecord.expiresAt
      } : null);

      if (!otpRecord) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Mark as verified
      otpRecord.verified = true;
      await otpRecord.save();

      // Clean up expired OTPs
      await OTP.deleteMany({ 
        identifier: email, 
        purpose,
        type: 'email',
        expiresAt: { $lt: new Date() }
      });

      return {
        success: true,
        message: 'Email verified successfully',
        email: otpRecord.identifier,
        userId: otpRecord.userId
      };

    } catch (error) {
      console.error('Email OTP verification error:', error);
      throw new Error('Failed to verify email OTP');
    }
  }

  async sendPasswordResetEmail(email, token, name) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Evenz.in'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request - Evenz.in',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>You have requested to reset your password. Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>Evenz.in Team</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', info.messageId);
      return info;

    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }
}

module.exports = new EmailService();