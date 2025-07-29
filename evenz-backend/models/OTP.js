// models/OTP.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true // For faster queries
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    enum: [
      'client_mobile_registration',
      'client_mobile_update',
      'client_email_update',
      'vendor_mobile_registration',
      'vendor_email_registration',
      'vendor_mobile_update',
      'vendor_email_update',
      'password_reset',
      'vendor_password_reset'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.purpose.includes('update'); // Required for update purposes
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    },
    expires: 0 // MongoDB TTL
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['mobile', 'email'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
otpSchema.index({ identifier: 1, purpose: 1, verified: 1, expiresAt: 1 });

module.exports = mongoose.model('OTP', otpSchema);