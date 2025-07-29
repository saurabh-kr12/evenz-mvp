// File: routes/caterers.js
const express = require('express');
const router = express.Router();
const { getCatererProfile, getAllCaterers,getProfileStatus } = require('../../controllers/catererController');
const { protect } = require('../../middleware/vendor/auth');


// Middleware to log requests for debugging
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, req.params);
  next();
});

// GET /api/caterers-details/ - Get all caterers (with filters)
router.get('/', getAllCaterers);

// GET /api/caterers-details/:catererId/view-profile - Get caterer full profile
router.get('/:catererId/view-profile', getCatererProfile);

router.get('/profile-status', protect, getProfileStatus);

module.exports = router;