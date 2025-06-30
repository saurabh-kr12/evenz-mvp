// // server/models/OTP.js
// const mongoose = require('mongoose');

// const otpSchema = new mongoose.Schema({
//   identifier: {
//     type: String,
//     required: true
//   },
//   otp: {
//     type: String,
//     required: true
//   },
//   purpose: {
//     type: String,
//     enum: ['registration', 'email-update', 'contact-update', 'password-reset'],
//     required: true
//   },
//   expiresAt: {
//     type: Date,
//     required: true,
//     default: function() {
//       return new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
//     }
//   },
//   verified: {
//     type: Boolean,
//     default: false
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, { timestamps: true });

// // Index will automatically delete expired OTPs
// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model('OTP', otpSchema);

// models/OTP.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{9,14}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    enum: ['registration', 'login', 'password_reset']
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes
  }
}, {
  timestamps: true
});

// Create index for automatic cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);