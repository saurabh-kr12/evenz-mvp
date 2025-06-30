// File: routes/vendor.js
const express = require('express');
const {
  getProfile,
  updateEmail,
  updateMobile,
  updateBusiness,
  updateAddress,
  updatePassword
} = require('../../controllers/vendor/vendorController');
const { protect } = require('../../middleware/vendor/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile route
router.get('/profile', getProfile);

// Update routes
router.patch('/update-email', updateEmail);
router.patch('/update-mobile', updateMobile);
router.patch('/update-business', updateBusiness);
router.patch('/update-address', updateAddress);
router.patch('/update-password', updatePassword);

module.exports = router;