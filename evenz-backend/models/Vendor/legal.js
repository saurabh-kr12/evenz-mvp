// File: models/Legal.js
const mongoose = require('mongoose');

const legalSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  // File uploads
  agreementContract: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  certificates: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // GST and business info
  gstRegistrationNumber: {
    type: String,
    trim: true
  },
  // Payment modes
  acceptedPaymentModes: {
    upi: { type: Boolean },
    cash: { type: Boolean },
    card: { type: Boolean },
    netBanking: { type: Boolean },
    wallet: { type: Boolean }
  },
  // Booking advance
  bookingAdvance: {
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, min: 0 }
  },
  // Service limits
  minGuests: { type: Number, min: 1 },
  maxGuests: { type: Number, min: 1 },
  minimumNoticeDays: { type: Number, min: 0, default: 1 },
  // Policies
  cancellationRefundPolicy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure one legal document per vendor
legalSchema.index({ vendor: 1 }, { unique: true });

module.exports = mongoose.model('Legal', legalSchema);

