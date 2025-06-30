// utils/generateOTP.js
exports.generateOTP = (length = 6) => {
   // Generate a random 6-digit number
   const min = Math.pow(10, length - 1);
   const max = Math.pow(10, length) - 1;
   return Math.floor(Math.random() * (max - min + 1) + min).toString();
 };
 
// utils/sendOTP.js
//  const config = require('config');
//  const nodemailer = require('nodemailer');
//  // For SMS you would typically use a service like Twilio, here we'll simulate it
 
//  /**
//   * Send OTP via email
//   * @param {string} email - Recipient email address
//   * @param {string} otp - One Time Password
//   */
//  exports.sendOTPByEmail = async (email, otp) => {
//    try {
//      // In production, use proper email service configuration
//      const transporter = nodemailer.createTransport({
//        host: config.get('emailHost'),
//        port: config.get('emailPort'),
//        secure: config.get('emailSecure'),
//        auth: {
//          user: config.get('emailUser'),
//          pass: config.get('emailPassword')
//        }
//      });
     
//      const mailOptions = {
//        from: `Evenz.in <${config.get('emailFrom')}>`,
//        to: email,
//        subject: 'Your Evenz.in OTP Code',
//        text: `Your OTP for Evenz.in is: ${otp}. This code will expire in 15 minutes.`,
//        html: `
//          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//            <h2 style="color: #333;">Your Evenz.in OTP Code</h2>
//            <p style="font-size: 16px; color: #555;">Please use the following OTP to complete your login/registration:</p>
//            <div style="background-color: #f7f7f7; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
//              <span style="font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #2874f0;">${otp}</span>
//            </div>
//            <p style="font-size: 14px; color: #777;">This code will expire in 15 minutes.</p>
//            <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
//            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
//            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Evenz.in. All rights reserved.</p>
//          </div>
//        `
//      };
     
//      await transporter.sendMail(mailOptions);
//      return true;
//    } catch (error) {
//      console.error('Email sending failed:', error);
//      throw new Error('Failed to send OTP via email');
//    }
//  };
 
//  /**
//   * Send OTP via SMS
//   * @param {string} phone - Recipient phone number
//   * @param {string} otp - One Time Password
//   */
//  exports.sendOTPBySMS = async (phone, otp) => {
//    try {
//      // In production, implement SMS gateway integration (e.g., Twilio)
//      // For now, we'll simulate success
     
//      console.log(`[SMS Simulation] Sending OTP ${otp} to ${phone}`);
     
//      // Uncomment and configure when integrating with a real SMS service
//      /*
//      const twilio = require('twilio');
//      const client = new twilio(
//        config.get('twilioAccountSid'),
//        config.get('twilioAuthToken')
//      );
     
//      await client.messages.create({
//        body: `Your Evenz.in OTP is: ${otp}. This code will expire in 15 minutes.`,
//        from: config.get('twilioPhoneNumber'),
//        to: phone
//      });
//      */
     
//      return true;
//    } catch (error) {
//      console.error('SMS sending failed:', error);
//      throw new Error('Failed to send OTP via SMS');
//    }
//  };