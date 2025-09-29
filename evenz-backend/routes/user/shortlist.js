// File: routes/shortlist.js
const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { protect } = require('../../middleware/user/auth');
const {
  addToShortlist,
  removeFromShortlist,
  getShortlist,
  checkShortlistStatus
} = require('../../controllers/shortlistController');

// All shortlist routes require authentication
router.use(protect);

// GET /api/shortlist - Get user's shortlist
router.get('/', getShortlist);

// POST /api/user/shortlist/:catererId - Add to shortlist
router.post(
  '/:catererId',
  [param('catererId').isMongoId().withMessage('Invalid Caterer ID format.')],
  addToShortlist
);

// DELETE /api/user/shortlist/:catererId - Remove from shortlist
router.delete(
  '/:catererId',
  [param('catererId').isMongoId().withMessage('Invalid Caterer ID format.')],
  removeFromShortlist
);

// GET /api/user/shortlist/:catererId/status - Check if caterer is shortlisted
router.get(
  '/:catererId/status',
  [param('catererId').isMongoId().withMessage('Invalid Caterer ID format.')],
  checkShortlistStatus
);

module.exports = router;