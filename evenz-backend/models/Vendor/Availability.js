// File: models/Vendor/Availability.js
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true,
    default: ''
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

// Compound index for vendor and date (unique combination)
availabilitySchema.index({ vendor: 1, date: 1 }, { unique: true });

// Index for efficient date range queries
availabilitySchema.index({ vendor: 1, date: 1, isAvailable: 1 });

// Pre-save middleware to update updatedAt
availabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get vendor availability for date range
availabilitySchema.statics.getVendorAvailability = async function(vendorId, startDate, endDate) {
  return this.find({
    vendor: vendorId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to bulk update availability
availabilitySchema.statics.bulkUpdateAvailability = async function(vendorId, updates) {
  const operations = updates.map(update => ({
    updateOne: {
      filter: { vendor: vendorId, date: update.date },
      update: {
        $set: {
          isAvailable: update.isAvailable,
          notes: update.notes || '',
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  }));

  return this.bulkWrite(operations);
};

// Instance method to toggle availability
availabilitySchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

module.exports = mongoose.model('Availability', availabilitySchema);