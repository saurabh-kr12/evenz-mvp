// File: routes/caterers.js
const express = require('express');
const router = express.Router();
const { getCatererProfile, getAllCaterers } = require('../../controllers/catererController');

// Middleware to log requests for debugging
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, req.params);
  next();
});

// GET /api/caterers-details/ - Get all caterers (with filters)
router.get('/', getAllCaterers);

// GET /api/caterers-details/:catererId/view-profile - Get caterer full profile
router.get('/:catererId/view-profile', getCatererProfile);

module.exports = router;