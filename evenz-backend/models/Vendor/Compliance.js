// File: models/Compliance.js
const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  fssaiLicense: {
    number: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  hygieneAudits: {
    details: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  ingredientSourcing: {
    details: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  allergenHandling: {
    details: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  insurance: {
    provided: {
      type: Boolean,
    },
    details: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Ensure one compliance record per vendor
complianceSchema.index({ vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Compliance', complianceSchema);