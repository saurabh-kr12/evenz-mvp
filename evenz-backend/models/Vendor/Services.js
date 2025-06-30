// File: models/Services.js
const mongoose = require('mongoose');

const liveCounterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  pricePerPlate: {
    type: Number,
    required: true,
    min: 0
  }
});

// Schema for custom options that can be reused
const customOptionSchema = new mongoose.Schema({
  specification: {
    type: String,
    required: true,
    trim: true
  },
  selected: {
    type: Boolean,
    default: false
  }
});

const servicesSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  mealServiceTypes: {
    buffet: { type: Boolean, default: false },
    plated: { type: Boolean, default: false },
    liveCounters: { type: Boolean, default: false },
    familyStyle: { type: Boolean, default: false },
    cocktailStyle: { type: Boolean, default: false },
    customOptions: [customOptionSchema], // Array of custom options
    other: {
      selected: { type: Boolean, default: false },
      specification: { type: String, default: '' }
    }
  },
  liveCounters: [liveCounterSchema],
  staffDetails: {
    type: String,
    default: '',
    trim: true
  },
  tableware: {
    plates: { type: Boolean, default: false },
    bowls: { type: Boolean, default: false },
    cutlery: { type: Boolean, default: false },
    glasses: { type: Boolean, default: false },
    servingUtensils: { type: Boolean, default: false },
    linens: { type: Boolean, default: false },
    customOptions: [customOptionSchema], // Array of custom options
    other: {
      selected: { type: Boolean, default: false },
      specification: { type: String, default: '' }
    }
  },
  setupBreakdownProcess: {
    type: String,
    default: '',
    trim: true
  },
  deliveryLogistics: {
    type: String,
    default: '',
    trim: true
  },
  availableForEvents: {
    birthday: { type: Boolean, default: false },
    wedding: { type: Boolean, default: false },
    corporate: { type: Boolean, default: false },
    funerals: { type: Boolean, default: false },
    religious: { type: Boolean, default: false },
    smallGathering: { type: Boolean, default: false },
    customOptions: [customOptionSchema], // Array of custom options
    other: {
      selected: { type: Boolean, default: false },
      specification: { type: String, default: '' }
    }
  },
  staffProvided: {
    ratio: {
      staffCount: { type: Number, default: 1, min: 1 },
      guestCount: { type: Number, default: 10, min: 1 }
    },
    cost: { type: Number, default: 0, min: 0 },
    costType: {
      type: String,
      enum: ['per_hour', 'per_night', 'per_day', 'per_event'],
      default: 'per_hour'
    }
  },
  waterService: {
    includedInPackage: { type: Boolean, default: false },
    jarWaterCharges: { type: Number, default: 0, min: 0 },
    bottleWaterCharges: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true
});

// Ensure one services document per vendor
servicesSchema.index({ vendor: 1 }, { unique: true });

module.exports = mongoose.model('Services', servicesSchema)