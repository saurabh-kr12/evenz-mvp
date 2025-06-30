const nodemailer = require('nodemailer');
const Otp = require('../../models/Vendor/vendorOtp');

// Function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send email OTP
const sendEmailOtp = async (email) => {
  try {
    // Generate OTP
    const otp = generateOtp();
    
    // Calculate expiry time
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save OTP to database
    await Otp.create({
      email,
      otp,
      type: 'email',
      expiresAt,
    });

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
    console.error('Error sending email OTP:', error);
    throw new Error('Failed to send email OTP');
  }
};

// Function to send mobile OTP
const sendMobileOtp = async (mobile) => {
  try {
    // Generate OTP
    const otp = generateOtp();

    // Calculate expiry time
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save OTP to database
    await Otp.create({
      mobile,
      otp,
      type: 'mobile',
      expiresAt,
    });

    // Integrate with Twilio
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Format mobile number - ensure it includes country code
    let formattedMobile = mobile;
    //  if (!mobile.startsWith('+')) {
    // Assuming Indian numbers and adding +91 prefix if not already present
    formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
    //  }

    // Send SMS via Twilio
    await client.messages.create({
      body: `Your Evenz.in verification code is: ${otp}. It will expire in ${expiryMinutes} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedMobile
    });

    return true;
  } catch (error) {
    console.error('Error sending mobile OTP:', error);
    throw new Error('Failed to send mobile OTP');
  }
};

module.exports = {
  sendEmailOtp,
  sendMobileOtp
};