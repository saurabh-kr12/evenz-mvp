// File: models/Menu.js
const mongoose = require('mongoose');

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Menu item type is required'],
    enum: ['starter', 'main', 'bread', 'beverage', 'dessert'],
    lowercase: true
  },
  vegNonVeg: {
    type: String,
    required: [true, 'Veg/Non-Veg classification is required'],
    enum: ['veg', 'non-veg'],
    lowercase: true
  },
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true
  },
  extraPrice: {
    type: Number,
    default: 0,
    min: [0, 'Extra price cannot be negative']
  }
}, {
  timestamps: true
});

// Package Schema
const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Package type is required'],
    enum: ['veg', 'non-veg', 'both'],
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  pricePerPlate: {
    type: Number,
    required: [true, 'Price per plate is required'],
    min: [0, 'Price cannot be negative']
  },
  itemCounts: {
    starters: {
      type: Number,
      default: 0,
      min: [0, 'Item count cannot be negative']
    },
    mains: {
      type: Number,
      default: 0,
      min: [0, 'Item count cannot be negative']
    },
    breads: {
      type: Number,
      default: 0,
      min: [0, 'Item count cannot be negative']
    },
    beverages: {
      type: Number,
      default: 0,
      min: [0, 'Item count cannot be negative']
    },
    desserts: {
      type: Number,
      default: 0,
      min: [0, 'Item count cannot be negative']
    }
  },
  menuItems: [menuItemSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Main Menu Schema
const menuSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required']
  },
  cuisines: [{
    type: String,
    required: [true, 'Cuisine name is required'],
    trim: true
  }],
  packages: {
    type: Map,
    of: [packageSchema],
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
menuSchema.index({ vendor: 1 });
menuSchema.index({ 'packages.name': 1 });
menuSchema.index({ cuisines: 1 });

// Virtual to get total packages count
menuSchema.virtual('totalPackages').get(function() {
  let count = 0;
  for (let packages of this.packages.values()) {
    count += packages.length;
  }
  return count;
});

// Method to add cuisine
menuSchema.methods.addCuisine = function(cuisine) {
  if (!this.cuisines.includes(cuisine)) {
    this.cuisines.push(cuisine);
    if (!this.packages.has(cuisine)) {
      this.packages.set(cuisine, []);
    }
  }
  return this;
};

// Method to remove cuisine
menuSchema.methods.removeCuisine = function(cuisine) {
  this.cuisines = this.cuisines.filter(c => c !== cuisine);
  this.packages.delete(cuisine);
  return this;
};

// Method to add package to cuisine
menuSchema.methods.addPackage = function(cuisine, packageData) {
  if (!this.packages.has(cuisine)) {
    this.packages.set(cuisine, []);
  }
  const packages = this.packages.get(cuisine);
  packages.push(packageData);
  this.packages.set(cuisine, packages);
  return this;
};

// Method to update package
menuSchema.methods.updatePackage = function(cuisine, packageId, updateData) {
  if (this.packages.has(cuisine)) {
    const packages = this.packages.get(cuisine);
    const packageIndex = packages.findIndex(pkg => pkg._id.toString() === packageId);
    if (packageIndex !== -1) {
      Object.assign(packages[packageIndex], updateData);
      this.packages.set(cuisine, packages);
    }
  }
  return this;
};

// Method to remove package
menuSchema.methods.removePackage = function(cuisine, packageId) {
  if (this.packages.has(cuisine)) {
    const packages = this.packages.get(cuisine);
    const filteredPackages = packages.filter(pkg => pkg._id.toString() !== packageId);
    this.packages.set(cuisine, filteredPackages);
  }
  return this;
};

// Method to add menu item to package
menuSchema.methods.addMenuItem = function(cuisine, packageId, menuItemData) {
  if (this.packages.has(cuisine)) {
    const packages = this.packages.get(cuisine);
    const packageIndex = packages.findIndex(pkg => pkg._id.toString() === packageId);
    if (packageIndex !== -1) {
      packages[packageIndex].menuItems.push(menuItemData);
      this.packages.set(cuisine, packages);
    }
  }
  return this;
};

// Method to update menu item
menuSchema.methods.updateMenuItem = function(cuisine, packageId, itemId, updateData) {
  if (this.packages.has(cuisine)) {
    const packages = this.packages.get(cuisine);
    const packageIndex = packages.findIndex(pkg => pkg._id.toString() === packageId);
    if (packageIndex !== -1) {
      const itemIndex = packages[packageIndex].menuItems.findIndex(item => item._id.toString() === itemId);
      if (itemIndex !== -1) {
        Object.assign(packages[packageIndex].menuItems[itemIndex], updateData);
        this.packages.set(cuisine, packages);
      }
    }
  }
  return this;
};

// Method to remove menu item
menuSchema.methods.removeMenuItem = function(cuisine, packageId, itemId) {
  if (this.packages.has(cuisine)) {
    const packages = this.packages.get(cuisine);
    const packageIndex = packages.findIndex(pkg => pkg._id.toString() === packageId);
    if (packageIndex !== -1) {
      packages[packageIndex].menuItems = packages[packageIndex].menuItems.filter(
        item => item._id.toString() !== itemId
      );
      this.packages.set(cuisine, packages);
    }
  }
  return this;
};

// Pre-save middleware to update timestamps
menuSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;