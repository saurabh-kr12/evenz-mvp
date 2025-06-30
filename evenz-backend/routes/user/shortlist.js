// File: routes/shortlist.js
const express = require('express');
const router = express.Router();
const {protect} = require('../../middleware/user/auth');
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

// POST /api/shortlist/:catererId - Add to shortlist
router.post('/:catererId', addToShortlist);

// DELETE /api/shortlist/:catererId - Remove from shortlist
router.delete('/:catererId', removeFromShortlist);

// GET /api/shortlist/:catererId/status - Check if caterer is shortlisted
router.get('/:catererId/status', checkShortlistStatus);

module.exports = router;