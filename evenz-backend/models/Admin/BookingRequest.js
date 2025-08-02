// /models/Admin/BookingRequest.js
const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String,
    required: true
  },
  catererId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  catererName: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Wedding', 'Birthday Party', 'Corporate Event', 'Pooja/Religious', 'Baby Shower', 'Housewarming', 'Small Get-Together', 'Other']
  },
  eventDate: {
    type: Date,
    required: true
  },
  numGuests: {
    type: Number,
    required: true,
    min: 1
  },
  eventLocation: {
    type: String,
    required: true
  },
  venueType: {
    type: String,
    enum: ['Banquet Hall', 'Home', 'Office', 'Open Ground', 'Rooftop', 'Other']
  },
  mealPreference: {
    type: [String],
    required: true,
    enum: ['Vegetarian Only', 'Non-Vegetarian', 'Mixed', 'Jain']
  },
  selectedCuisine: {
    type: String,
    required: true
  },
  selectedPackage: {
    name: { type: String, required: true },
    pricePerPlate: { type: Number, required: true },
    inclusions: {
      numStarters: Number,
      numMains: Number,
      numBeverages: Number,
      numBreads: Number,
      numDesserts: Number,
      other: String
    }
  },
  selectedLiveCounters: [{
    name: String,
    costType: { type: String, enum: ['per_person'] },
    cost: Number
  }],
  specialRequests: String,
  estimatedCost: {
    type: Number,
    required: true
  },
  
  // UPDATED: Enhanced status for the booking request lifecycle
  status: {
    type: String,
    enum: ['PENDING', 'UNLOCKED', 'CONFIRMED', 'NOT_CONFIRMED', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // NEW: Unlock fee configuration
  unlock_fee: {
    type: Number,
    default: parseInt(process.env.UNLOCK_FEE) || 200, // Default to 1 if not set in .env
  },
  
  // NEW: Razorpay payment details
  razorpay_order_id: {
    type: String,
    sparse: true
  },
  razorpay_payment_id: {
    type: String,
    sparse: true
  },
  razorpay_signature: {
    type: String,
    sparse: true
  },
  payment_status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'NOT_APPLICABLE'],
    default: 'NOT_APPLICABLE'
  },
  
  // NEW: Timestamps for status transitions
  unlocked_at: {
    type: Date
  },
  confirmed_at: {
    type: Date
  },
  not_confirmed_at: {
    type: Date
  },
  
  // Legacy fields for backward compatibility
  unlockedByAdminAt: Date,
  unlockedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vendorNotes: String
}, {
  timestamps: true
});

// Indexes for better query performance
bookingRequestSchema.index({ catererId: 1, status: 1 });
bookingRequestSchema.index({ razorpay_order_id: 1 });
bookingRequestSchema.index({ clientId: 1 });

// Check if model already exists before creating it
module.exports = mongoose.models.BookingRequest || mongoose.model('BookingRequest', bookingRequestSchema);