// // File: models/Media.js
// const mongoose = require('mongoose');

// // Experience Media Schema
// const experienceMediaSchema = new mongoose.Schema({
//   vendor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vendor',
//     required: true
//   },
//   filename: {
//     type: String,
//     required: true
//   },
//   originalName: {
//     type: String,
//     required: true
//   },
//   path: {
//     type: String,
//     required: true
//   },
//   size: {
//     type: Number,
//     required: true
//   },
//   mimetype: {
//     type: String,
//     required: true
//   },
//   isCoverImage: {
//     type: Boolean,
//     default: false
//   },
//   experience:{
//    type: Number,
//   },
//   uploadedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Create compound index for vendor queries and ensure proper indexing
// experienceMediaSchema.index({ vendor: 1, uploadedAt: -1 });
// experienceMediaSchema.index({ vendor: 1, isCoverImage: 1 });

// // Pre-save middleware to ensure only one cover image per vendor
// experienceMediaSchema.pre('save', async function(next) {
//   if (this.isCoverImage && this.isModified('isCoverImage')) {
//     // Remove cover image status from other images of the same vendor
//     await this.constructor.updateMany(
//       { vendor: this.vendor, _id: { $ne: this._id } },
//       { $set: { isCoverImage: false } }
//     );
//   }
//   next();
// });

// module.exports = mongoose.model('Media', experienceMediaSchema);

// File: models/Vendor/media.js
const mongoose = require('mongoose');

// Experience Media Schema
const experienceMediaSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  originalName: {
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
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for vendor queries
experienceMediaSchema.index({ vendor: 1, uploadedAt: -1 });

// Static method to find vendor's profile data
experienceMediaSchema.statics.findVendorProfile = function(vendorId) {
  return this.findOne({ vendor: vendorId });
};

// Static method to update or create vendor profile
experienceMediaSchema.statics.updateVendorProfile = function(vendorId, profileData) {
  return this.findOneAndUpdate(
    { vendor: vendorId },
    profileData,
    { 
      new: true, 
      upsert: true, 
      runValidators: true 
    }
  );
};

module.exports = mongoose.model('Media', experienceMediaSchema);