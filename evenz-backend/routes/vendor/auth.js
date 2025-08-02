// File: routes/vendor/auth.js
const express = require('express');
const {
  login,
  handleLogout,
  handleRefreshToken
} = require('../../controllers/vendor/VendorAuthController');
const {body } = require('express-validator');

const router = express.Router();

router.post('/login', [
    body('identifier', 'Email or mobile number is required').not().isEmpty().trim(),
    body('password', 'Password cannot be empty').not().isEmpty(),
], login);

router.get('/refresh', handleRefreshToken); // ADD
router.post('/logout', handleLogout);      // ADD

module.exports = router;