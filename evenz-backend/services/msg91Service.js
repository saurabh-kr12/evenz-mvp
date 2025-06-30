// // services/msg91Service.js
// const axios = require('axios');

// class MSG91Service {
//   constructor() {
//     this.apiKey = process.env.MSG91_API_KEY;
//     this.templateId = process.env.MSG91_TEMPLATE_ID;
//     this.baseURL = 'https://control.msg91.com/api/v5';
    
//     if (!this.apiKey) {
//       console.error('MSG91_API_KEY is not configured');
//     }
//   }

//   // Generate 6-digit OTP
//   generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   }

//   // Send OTP via MSG91
//   async sendOTP(phone, otp, purpose = 'verification') {
//     try {
//       // Remove any non-digit characters and ensure proper format
//       const cleanPhone = phone.replace(/\D/g, '');
      
//       // If phone doesn't start with country code, assume it's Indian (+91)
//       const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

//       const payload = {
//         template_id: this.templateId,
//         short_url: "0",
//         recipients: [
//           {
//             mobiles: formattedPhone,
//             var1: otp,
//             var2: purpose
//           }
//         ]
//       };

//       const response = await axios.post(`${this.baseURL}/flow/`, payload, {
//         headers: {
//           'Authkey': this.apiKey,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('MSG91 Response:', response.data);

//       if (response.data.type === 'success') {
//         return {
//           success: true,
//           message: 'OTP sent successfully',
//           requestId: response.data.request_id
//         };
//       } else {
//         throw new Error(response.data.message || 'Failed to send OTP');
//       }

//     } catch (error) {
//       console.error('MSG91 Error:', error.response?.data || error.message);
      
//       // Return a generic success for development (remove in production)
//       if (process.env.NODE_ENV === 'development') {
//         console.log(`Development mode: OTP ${otp} would be sent to ${phone}`);
//         return {
//           success: true,
//           message: 'OTP sent successfully (development mode)',
//           requestId: 'dev_' + Date.now()
//         };
//       }
      
//       throw new Error('Failed to send OTP. Please try again.');
//     }
//   }

//   // Alternative method using MSG91's simpler SMS API
//   async sendSMS(phone, message) {
//     try {
//       const cleanPhone = phone.replace(/\D/g, '');
//       const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

//       const response = await axios.get(`${this.baseURL}/sendSMS`, {
//         params: {
//           authkey: this.apiKey,
//           mobiles: formattedPhone,
//           message: message,
//           sender: process.env.MSG91_SENDER_ID || 'VERIFY',
//           route: '4'
//         }
//       });

//       console.log('MSG91 SMS Response:', response.data);

//       if (response.data.type === 'success') {
//         return {
//           success: true,
//           message: 'SMS sent successfully',
//           requestId: response.data.request_id
//         };
//       } else {
//         throw new Error(response.data.message || 'Failed to send SMS');
//       }

//     } catch (error) {
//       console.error('MSG91 SMS Error:', error.response?.data || error.message);
      
//       // Return success for development
//       if (process.env.NODE_ENV === 'development') {
//         console.log(`Development mode: SMS "${message}" would be sent to ${phone}`);
//         return {
//           success: true,
//           message: 'SMS sent successfully (development mode)',
//           requestId: 'dev_' + Date.now()
//         };
//       }
      
//       throw new Error('Failed to send SMS. Please try again.');
//     }
//   }
// }

// module.exports = new MSG91Service();