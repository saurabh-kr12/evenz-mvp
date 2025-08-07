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

  }
});

const servicesSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  mealServiceTypes: {
    buffet: { type: Boolean },
    plated: { type: Boolean },
    liveCounters: { type: Boolean },
    familyStyle: { type: Boolean },
    cocktailStyle: { type: Boolean },
    customOptions: [customOptionSchema], // Array of custom options
    other: {
      selected: { type: Boolean },
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
    plates: { type: Boolean },
    bowls: { type: Boolean },
    cutlery: { type: Boolean },
    glasses: { type: Boolean },
    servingUtensils: { type: Boolean },
    linens: { type: Boolean },
    customOptions: [customOptionSchema], // Array of custom options
    other: {
      selected: { type: Boolean },
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
    birthday: { type: Boolean },
    wedding: { type: Boolean },
    corporate: { type: Boolean },
    funerals: { type: Boolean },
    religious: { type: Boolean },
    smallGathering: { type: Boolean },
    customOptions: [customOptionSchema], // Array of custom options
    other: {
      selected: { type: Boolean },
      specification: { type: String, default: '' }
    }
  },
  staffProvided: {
    ratio: {
      staffCount: { type: Number, min: 1 },
      guestCount: { type: Number, min: 1 }
    },
    cost: { type: Number, default: 0, min: 0 },
    costType: {
      type: String,
      enum: ['per_hour', 'per_night', 'per_day', 'per_event'],
      default: 'per_hour'
    }
  },
  waterService: {
    includedInPackage: { type: Boolean },
    jarWaterCharges: { type: Number, default: 0, min: 0 },
    bottleWaterCharges: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true
});

// Ensure one services document per vendor
servicesSchema.index({ vendor: 1 }, { unique: true });

module.exports = mongoose.model('Services', servicesSchema)