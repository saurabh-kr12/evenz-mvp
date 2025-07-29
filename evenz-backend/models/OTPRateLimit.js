// models/OTPRateLimit.js
const mongoose = require('mongoose');

const otpRateLimitSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true
  },
  purpose: {
    type: String,
    required: true,
    enum: [
      'client_mobile_registration',
      'client_mobile_update',
      'client_email_update',
      'vendor_mobile_registration',
      'vendor_mobile_update',
      'vendor_email_update',
      'vendor_email_registration',
      'password_reset',
      'vendor_password_reset'
    ]
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  resetTime: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
otpRateLimitSchema.index({ identifier: 1, purpose: 1 });

module.exports = mongoose.model('OTPRateLimit', otpRateLimitSchema);