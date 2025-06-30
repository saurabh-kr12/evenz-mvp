// server/utils/otp.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const OTP = require('../models/User/Otp');

// Configure nodemailer (replace with your email service details)
const emailTransporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
   }
});

// Configure Twilio client (replace with your Twilio credentials)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate a 6-digit OTP
const generateOTP = () => {
   return Math.floor(100000 + Math.random() * 900000).toString();
};

// Determine if identifier is email or phone
const isEmail = (identifier) => {
   const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
   return emailRegex.test(identifier);
};

// Save OTP to database
const saveOTP = async (identifier, otp, purpose, userId = null) => {
   // Delete any existing OTPs for this identifier and purpose
   await OTP.deleteMany({ identifier, purpose });

   // Create new OTP
   const newOTP = new OTP({
      identifier,
      otp,
      purpose,
      userId
   });

   await newOTP.save();
   return newOTP;
};

// Send OTP via email
const sendEmailOTP = async (email, otp) => {
   try {
      // Create reusable transporter object using SMTP transport
      const transporter = nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         secure: process.env.EMAIL_SECURE === 'true',
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
         },
      });

      const appName = process.env.APP_NAME || 'Evenz.in';

      // Email content
      const mailOptions = {
         from: `"${appName}" <${process.env.EMAIL_FROM}>`,
         to: email,
         subject: `Your OTP Code for ${appName}`,
         html: `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
             <h2 style="color: #333;">Your One-Time Password</h2>
             <p>Hello,</p>
             <p>Your OTP code for ${appName} is:</p>
             <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
               ${otp}
             </div>
             <p>This code will expire in 15 minutes.</p>
             <p>If you didn't request this code, please ignore this email.</p>
             <p>Thank you,<br>The ${appName} Team</p>
           </div>
         `,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      console.log(`OTP email sent to ${email}: ${info.messageId}`);
      return info;
   } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP via email');
   }
};

// Send OTP via SMS
const sendSMSOTP = async (phoneNumber, otp) => {
   try {
      // For development/testing, just log to console
      console.log(`[SMS OTP] To: ${phoneNumber}, OTP: ${otp}`);

      // In production, uncomment this to actually send SMS

      //  if (!twilioClient) {
      //    throw new Error('Twilio client not configured');
      //  }
      // Initialize Twilio client
      const client = twilio(
         process.env.TWILIO_ACCOUNT_SID,
         process.env.TWILIO_AUTH_TOKEN
      );
      const appName = process.env.APP_NAME || 'Evenz.in';

      // Format phone number if needed (ensure it's in E.164 format)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      console.log(formattedPhone, process.env.TWILIO_PHONE_NUMBER)
      //  await twilioClient.messages.create({
      //    body: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      //    from: process.env.TWILIO_PHONE_NUMBER,
      //    to: formattedPhone
      //  });
      // Send SMS
      const message = await client.messages.create({
         body: `Your ${appName} verification code is: ${otp}. This code will expire in 15 minutes.`,
         from: process.env.TWILIO_PHONE_NUMBER,
         to: formattedPhone,
      });

      console.log(`OTP SMS sent to ${phoneNumber}: ${message.sid}`);
      return message;

      //  return true;
   } catch (error) {
      console.error('Error sending SMS OTP:', error);
      throw new Error('Failed to send OTP via SMS');
   }
};

// Send OTP based on identifier type
const sendOTP = async (identifier, otp) => {
   if (isEmail(identifier)) {
      return await sendEmailOTP(identifier, otp);
   } else {
      return await sendSMSOTP(identifier, otp);
   }
};

// Verify OTP
const verifyOTP = async (identifier, otpToVerify, purpose) => {
   const otpRecord = await OTP.findOne({
      identifier,
      purpose,
      expiresAt: { $gt: new Date() }  // Not expired
   });

   if (!otpRecord) {
      return { valid: false, message: 'OTP expired or not found' };
   }

   if (otpRecord.otp !== otpToVerify) {
      return { valid: false, message: 'Invalid OTP' };
   }

   // Mark as verified
   otpRecord.verified = true;
   await otpRecord.save();

   return {
      valid: true,
      message: 'OTP verified successfully',
      userId: otpRecord.userId
   };
};

module.exports = {
   generateOTP,
   saveOTP,
   sendOTP,
   verifyOTP,
   isEmail
};