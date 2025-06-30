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
  status: {
    type: String,
    enum: ['pending', 'unlocked', 'confirmed', 'rejected'],
    default: 'pending'
  },
  unlockedByAdminAt: Date,
  unlockedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// module.exports = mongoose.model('BookingRequest', bookingRequestSchema);

// Check if model already exists before creating it
module.exports = mongoose.models.BookingRequest || mongoose.model('BookingRequest', bookingRequestSchema);

