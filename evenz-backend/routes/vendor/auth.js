// File: routes/auth.js
const express = require('express');
const {
  login,
} = require('../../controllers/vendor/VendorAuthController');

const router = express.Router();

// Login route
router.post('/login', login);

module.exports = router;