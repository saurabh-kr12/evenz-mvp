// File: models/Vendor/Customization.js
const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true
  },
  allowCustomization: {
    type: Boolean,

  },
  customizationCharges: {
    hasCharges: {
      type: Boolean,

    },
    chargeType: {
      type: String,
      enum: ['per_plate', 'fixed'],
      default: 'per_plate'
    },
    amount: {
      type: Number,
      min: [0, 'Charge amount cannot be negative'],
      default: 0
    }
  },
  specialMenus: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special menus description cannot exceed 1000 characters']
  },
  dietaryFilters: {
    vegan: {
      type: Boolean,

    },
    jain: {
      type: Boolean,

    },
    vegetarian: {
      type: Boolean,

    },
    glutenFree: {
      type: Boolean,

    },
    diabeticFriendly: {
      type: Boolean,

    },
    lowSodium: {
      type: Boolean,

    },
    custom: [{
      type: String,
      trim: true,
      maxlength: [50, 'Custom dietary filter cannot exceed 50 characters']
    }]
  },
  tastingSession: {
    allowed: {
      type: Boolean,

    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Tasting session description cannot exceed 500 characters']
    }
  }
}, {
  timestamps: true
});

// Index for efficient vendor lookups
customizationSchema.index({ vendor: 1 });

// Middleware to clean up custom dietary filters before saving
customizationSchema.pre('save', function (next) {
  if (this.dietaryFilters && this.dietaryFilters.custom) {
    // Remove empty strings and duplicates
    this.dietaryFilters.custom = [...new Set(
      this.dietaryFilters.custom
        .filter(filter => filter && filter.trim().length > 0)
        .map(filter => filter.trim())
    )];
  }
  next();
});

// Middleware to clean up custom dietary filters before update
customizationSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  if (update.dietaryFilters && update.dietaryFilters.custom) {
    // Remove empty strings and duplicates
    update.dietaryFilters.custom = [...new Set(
      update.dietaryFilters.custom
        .filter(filter => filter && filter.trim().length > 0)
        .map(filter => filter.trim())
    )];
  }
  next();
});

// Virtual to get total custom filters count
customizationSchema.virtual('customFiltersCount').get(function () {
  return this.dietaryFilters.custom ? this.dietaryFilters.custom.length : 0;
});

// Virtual to check if any dietary filters are enabled
customizationSchema.virtual('hasDietaryFilters').get(function () {
  const filters = this.dietaryFilters;
  return filters.vegan || filters.jain || filters.vegetarian ||
    filters.glutenFree || filters.diabeticFriendly || filters.lowSodium ||
    (filters.custom && filters.custom.length > 0);
});

// Method to get all active dietary filters
customizationSchema.methods.getActiveDietaryFilters = function () {
  const filters = this.dietaryFilters;
  const active = [];

  if (filters.vegan) active.push('Vegan');
  if (filters.jain) active.push('Jain');
  if (filters.vegetarian) active.push('Vegetarian');
  if (filters.glutenFree) active.push('Gluten Free');
  if (filters.diabeticFriendly) active.push('Diabetic Friendly');
  if (filters.lowSodium) active.push('Low Sodium');

  if (filters.custom && filters.custom.length > 0) {
    active.push(...filters.custom);
  }

  return active;
};

// Method to add custom dietary filter
customizationSchema.methods.addCustomDietaryFilter = function (filter) {
  if (!filter || typeof filter !== 'string') return false;

  const trimmedFilter = filter.trim();
  if (trimmedFilter.length === 0 || trimmedFilter.length > 50) return false;

  if (!this.dietaryFilters.custom) {
    this.dietaryFilters.custom = [];
  }

  // Check if filter already exists (case insensitive)
  const exists = this.dietaryFilters.custom.some(
    existing => existing.toLowerCase() === trimmedFilter.toLowerCase()
  );

  if (!exists) {
    this.dietaryFilters.custom.push(trimmedFilter);
    return true;
  }

  return false;
};

// Method to remove custom dietary filter
customizationSchema.methods.removeCustomDietaryFilter = function (filter) {
  if (!filter || !this.dietaryFilters.custom) return false;

  const initialLength = this.dietaryFilters.custom.length;
  this.dietaryFilters.custom = this.dietaryFilters.custom.filter(
    existing => existing.toLowerCase() !== filter.toLowerCase()
  );

  return this.dietaryFilters.custom.length < initialLength;
};

// Static method to get customization with defaults
customizationSchema.statics.getWithDefaults = async function (vendorId) {
  let customization = await this.findOne({ vendor: vendorId });

  if (!customization) {
    customization = new this({ vendor: vendorId });
    await customization.save();
  }

  return customization;
};

module.exports = mongoose.model('Customization', customizationSchema);