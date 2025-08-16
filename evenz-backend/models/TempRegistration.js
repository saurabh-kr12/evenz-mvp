// File: models/TempRegistration.js
const mongoose = require('mongoose');

const tempRegistrationSchema = new mongoose.Schema({
    tempId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Business & Location Info (from Step 1)
    ownerName: { type: String, required: true },
    businessName: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    locality: { type: String, required: true },

    // Contact & Security Info (from Step 2)
    mobileNumber: { type: String },
    emailAddress: { type: String },
    password: { type: String },
    
    // Verification Status
    mobileVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    
    // Session Expiry
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        expires: 3600 // Automatically delete after 1 hour
    }
}, { timestamps: true });

module.exports = mongoose.model('TempRegistration', tempRegistrationSchema);
