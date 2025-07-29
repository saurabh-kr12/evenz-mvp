// models/TempRegistration.js
const mongoose = require('mongoose');

const tempRegistrationSchema = new mongoose.Schema({
  tempId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ownerName: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  businessName: {
    type: String
  },
  pincode: {
    type: String
  },
  locality: {
    type: String
  },
  // NEW FIELD: Track if user agreed to terms during registration
  agreeToTerms: {
    type: Boolean,
    default: false
  },
  mobileVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // 30 minutes in seconds
  }
});

module.exports = mongoose.model('TempRegistration', tempRegistrationSchema);