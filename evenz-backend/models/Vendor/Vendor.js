// 1. Updated Vendor Model (models/Vendor.js)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  pinCode: {
    type: String,
    required: [true, 'Pin code is required'],
    trim: true,
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pin code']
  },
  locality: {
    type: String,
    required: [true, 'Locality is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  // NEW FIELD: State
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  fullAddress: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  mobileVerified: {
    type: Boolean,
    default: false
  },
  // NEW FIELD: Registration completion status
  isRegistered: {
    type: Boolean,
    default: false
  },
  // NEW FIELDS: Terms and Privacy Policy acceptance tracking
  termsAccepted: {
    type: Boolean,
    required: [true, 'Terms acceptance is required'],
    default: false
  },
  termsAcceptedAt: {
    type: Date,
    required: function () {
      return this.termsAccepted;
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  free_unlock_used: {
    type: Boolean,
    default: false
  },
  free_unlock_used_at: {
    type: Date,
    default: null
  },
  total_unlocks_purchased: {
    type: Number,
    default: 0
  },
  total_revenue_generated: {
    type: Number,
    default: 0
  },
  last_unlock_date: {
    type: Date,
    default: null
  },
  rank: {
    type: Number,
    default: 99, // A high number ensures unranked vendors appear last
    index: true  // Improves sorting performance
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware to hash password before save
vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for better query performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ mobile: 1 });
vendorSchema.index({ free_unlock_used: 1 });

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);