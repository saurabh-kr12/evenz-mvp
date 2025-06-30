// File: models/Shortlist.js
const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model for clients
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  shortlistedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one shortlist entry per user-vendor pair
shortlistSchema.index({ user: 1, vendor: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', shortlistSchema);