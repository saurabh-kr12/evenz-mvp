// File: models/Media.js
const mongoose = require('mongoose');

// Experience Media Schema
const experienceMediaSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  isCoverImage: {
    type: Boolean,
    default: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for vendor queries and ensure proper indexing
experienceMediaSchema.index({ vendor: 1, uploadedAt: -1 });
experienceMediaSchema.index({ vendor: 1, isCoverImage: 1 });

// Pre-save middleware to ensure only one cover image per vendor
experienceMediaSchema.pre('save', async function(next) {
  if (this.isCoverImage && this.isModified('isCoverImage')) {
    // Remove cover image status from other images of the same vendor
    await this.constructor.updateMany(
      { vendor: this.vendor, _id: { $ne: this._id } },
      { $set: { isCoverImage: false } }
    );
  }
  next();
});

module.exports = mongoose.model('Media', experienceMediaSchema);