// const nodemailer = require('nodemailer');
// const config = require('config');
// const twilio = require('twilio');

// /**
//  * Sends OTP via email
//  * @param {string} email - Email address to send OTP
//  * @param {string} otp - The OTP code to send
//  * @returns {Promise<void>}
//  */
// exports.sendOTPByEmail = async (email, otp) => {
//   try {
//     // Create reusable transporter object using SMTP transport
//     const transporter = nodemailer.createTransport({
//       host: config.get('email.host'),
//       port: config.get('email.port'),
//       secure: config.get('email.secure'), // true for 465, false for other ports
//       auth: {
//         user: config.get('email.user'),
//         pass: config.get('email.password'),
//       },
//     });

//     // Email content
//     const mailOptions = {
//       from: `"${config.get('app.name')}" <${config.get('email.from')}>`,
//       to: email,
//       subject: `Your OTP Code for ${config.get('app.name')}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <h2 style="color: #333;">Your One-Time Password</h2>
//           <p>Hello,</p>
//           <p>Your OTP code for ${config.get('app.name')} is:</p>
//           <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
//             ${otp}
//           </div>
//           <p>This code will expire in 15 minutes.</p>
//           <p>If you didn't request this code, please ignore this email.</p>
//           <p>Thank you,<br>The ${config.get('app.name')} Team</p>
//         </div>
//       `,
//     };

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
    
//     console.log(`OTP email sent to ${email}: ${info.messageId}`);
//     return info;
//   } catch (error) {
//     console.error('Error sending OTP email:', error);
//     throw new Error('Failed to send OTP via email');
//   }
// };

// /**
//  * Sends OTP via SMS
//  * @param {string} phone - Phone number to send OTP
//  * @param {string} otp - The OTP code to send
//  * @returns {Promise<void>}
//  */
// exports.sendOTPBySMS = async (phone, otp) => {
//   try {
//     // Initialize Twilio client
//     const client = twilio(
//       config.get('twilio.accountSid'),
//       config.get('twilio.authToken')
//     );

//     // Format phone number if needed (ensure it's in E.164 format)
//     // If phone number doesn't start with +, add it
//     const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

//     // Send SMS
//     const message = await client.messages.create({
//       body: `Your ${config.get('app.name')} verification code is: ${otp}. This code will expire in 15 minutes.`,
//       from: config.get('twilio.phoneNumber'),
//       to: formattedPhone,
//     });

//     console.log(`OTP SMS sent to ${phone}: ${message.sid}`);
//     return message;
//   } catch (error) {
//     console.error('Error sending OTP SMS:', error);
//     throw new Error('Failed to send OTP via SMS');
//   }
// };
const nodemailer = require('nodemailer');
const config = require('config');
const twilio = require('twilio');

/**
 * Sends OTP via email
 * @param {string} email - Email address to send OTP
 * @param {string} otp - The OTP code to send
 * @returns {Promise<void>}
 */
exports.sendOTPByEmail = async (email, otp) => {
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

/**
 * Sends OTP via SMS
 * @param {string} phone - Phone number to send OTP
 * @param {string} otp - The OTP code to send
 * @returns {Promise<void>}
 */
exports.sendOTPBySMS = async (phone, otp) => {
  try {
    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Format phone number if needed (ensure it's in E.164 format)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const appName = process.env.APP_NAME || 'Evenz.in';

    // Send SMS
    const message = await client.messages.create({
      body: `Your ${appName} verification code is: ${otp}. This code will expire in 15 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`OTP SMS sent to ${phone}: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    throw new Error('Failed to send OTP via SMS');
  }
};