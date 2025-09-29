const axios = require('axios');
const crypto = require('crypto');
const OTP = require('../models/OTP');
const OTPRateLimit = require('../models/OTPRateLimit');

// This is the official endpoint for the Brevo (Sendinblue) Transactional API
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

class EmailService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        if (!this.apiKey) {
            console.error('FATAL ERROR: BREVO_API_KEY is not defined in environment variables.');
        }
    }

    // --- Token & OTP Generation ---
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // --- Rate Limiting Logic (from your original file) ---
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
        await OTPRateLimit.findOneAndUpdate(
            { identifier, purpose },
            { $inc: { attempts: 1 }, lastAttempt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }
    
    // --- Core Email Sending (using Brevo API) ---
    async sendEmail(toEmail, toName, subject, htmlContent) {
        if (!this.apiKey) {
            throw new Error('Email service is not configured.');
        }

        const payload = {
            sender: {
                name: 'Evenz.in',
                email: 'no-reply@evenz.in' // Make sure this is a verified sender in Brevo
            },
            to: [{ email: toEmail, name: toName }],
            subject: subject,
            htmlContent: htmlContent
        };

        try {
            await axios.post(BREVO_API_URL, payload, {
                headers: { 'api-key': this.apiKey, 'Content-Type': 'application/json' }
            });
            return { success: true };
        } catch (error) {
            console.error('Brevo API Error:', error.response ? error.response.data : error.message);
            throw new Error('Failed to send email. Please try again later.');
        }
    }

    // --- High-Level Service Functions ---
    async sendEmailOTP(email, purpose, userId, userName) {
        try {
            // 1. Check rate limit first
            const rateLimitCheck = await this.checkRateLimit(email, purpose);
            if (!rateLimitCheck.allowed) {
                throw new Error(rateLimitCheck.message);
            }

            const otp = this.generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await OTP.findOneAndUpdate(
                { identifier: email, purpose },
                { otp, expiresAt, userId: userId || null, type: 'email' },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Hello ${userName || ''},</h2>
                    <p>Your verification code for Evenz.in is:</p>
                    <h1 style="font-size: 36px; letter-spacing: 4px; margin: 20px 0;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `;

            await this.sendEmail(email, userName, 'Your Evenz.in Verification Code', htmlContent);
            
            // 2. Increment rate limit after successful send
            await this.incrementRateLimit(email, purpose);

            return { 
                success: true, 
                message: 'OTP sent successfully to your email.',
                attemptsLeft: rateLimitCheck.attemptsLeft - 1
            };
        } catch (error) {
            console.error('Error in sendEmailOTP:', error);
            throw error;
        }
    }

    async verifyEmailOTP(email, otp, purpose) {
        try {
            const otpRecord = await OTP.findOne({
                identifier: email,
                otp: otp,
                purpose: purpose,
                verified: false,
                expiresAt: { $gt: new Date() }
            });

            if (!otpRecord) {
                return { success: false, message: 'Invalid or expired OTP.' };
            }

            otpRecord.verified = true;
            await otpRecord.save();
            
            return { success: true, message: 'Email verified successfully.', userId: otpRecord.userId };
        } catch (error) {
            console.error('Error verifying email OTP:', error);
            throw new Error('An error occurred during OTP verification.');
        }
    }

    async sendPasswordResetEmail(email, token, userName) {
        try {
            const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Hello ${userName || ''},</h2>
                    <p>You requested a password reset. Please click the link below to set a new password. This link is valid for 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px;">
                        Reset Your Password
                    </a>
                </div>
            `;

            await this.sendEmail(email, userName, 'Evenz.in - Password Reset Request', htmlContent);
            return { success: true };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email. Please try again later.');
        }
    }
}

module.exports = new EmailService();
