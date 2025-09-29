// server/routes/bookings.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const BookingRequest = require('../../models/Admin/BookingRequest');
const Vendor = require('../../models/Vendor/Vendor');
const { body, validationResult } = require('express-validator');
const Admin = require('../../models/Admin/Admin'); // You'll need to create this model
const { protect } = require('../../middleware/user/auth');
const { protect: protectVendor } = require('../../middleware/vendor/auth');
const { protect: protectAdmin } = require('../../middleware/admin/auth'); // You'll need to create this

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ,
  key_secret: process.env.RAZORPAY_KEY_SECRET ,
});

// POST /api/booking/booking-requests (Your existing route - keep as is)
// router.post('/booking-requests', protect, async (req, res) => {
//   try {
//     const {
//       catererId,
//       eventType,
//       eventDate,
//       numGuests,
//       eventLocation,
//       venueType,
//       mealPreference,
//       selectedCuisine,
//       selectedPackage,
//       selectedLiveCounters = [],
//       specialRequests,
//       estimatedCost
//     } = req.body;

//     // Server-side validation
//     if (!catererId || !eventType || !eventDate || !numGuests || !eventLocation || 
//         !mealPreference || !selectedCuisine || !selectedPackage) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     // Fetch caterer details for validation
//     const caterer = await Vendor.findById(catererId);
//     if (!caterer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Caterer not found'
//       });
//     }

//     // Create booking request
//     const bookingRequest = new BookingRequest({
//       clientId: req.user._id,
//       clientName: req.user.name,
//       clientPhone: req.user.mobile,
//       catererId,
//       catererName: caterer.businessName,
//       eventType,
//       eventDate: new Date(eventDate),
//       numGuests,
//       eventLocation,
//       venueType,
//       mealPreference,
//       selectedCuisine,
//       selectedPackage,
//       selectedLiveCounters,
//       specialRequests,
//       estimatedCost
//     });

//     await bookingRequest.save();

//     res.status(201).json({
//       success: true,
//       data: bookingRequest,
//       message: 'Booking request submitted successfully'
//     });

//   } catch (error) {
//     console.error('Error creating booking request:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });
// POST /api/booking/booking-requests
router.post(
    '/booking-requests', 
    protect, 
    [ // --- THE FIX: Added robust validation and sanitization ---
        body('catererId').isMongoId().withMessage('Invalid caterer ID.'),
        body('eventType').not().isEmpty().withMessage('Event type is required.').matches(safeTextRegex).trim().escape(),
        body('eventDate').isISO8601().toDate().withMessage('Invalid event date.'),
        body('numGuests').isInt({ min: 1 }).withMessage('Number of guests must be a positive number.'),
        body('eventLocation').not().isEmpty().withMessage('Event location is required.').matches(safeTextRegex).trim().escape(),
        body('venueType').not().isEmpty().withMessage('Venue type is required.').matches(safeTextRegex).trim().escape(),
        body('mealPreference').isArray({ min: 1 }).withMessage('At least one meal preference is required.'),
        body('mealPreference.*').isString().trim().escape(),
        body('selectedCuisine').not().isEmpty().withMessage('Cuisine selection is required.').matches(safeTextRegex).trim().escape(),
        body('selectedPackage.name').not().isEmpty().withMessage('Package name is required.').matches(safeTextRegex).trim().escape(),
        body('selectedPackage.pricePerPlate').isNumeric().withMessage('Package price must be a number.'),
        body('specialRequests').optional().matches(safeTextRegex).withMessage('Special requests contain invalid characters.').trim().escape(),
        body('estimatedCost').isNumeric().withMessage('Estimated cost must be a number.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
  
        try {
            const {
                catererId, eventType, eventDate, numGuests, eventLocation, 
                venueType, mealPreference, selectedCuisine, selectedPackage, 
                selectedLiveCounters = [], specialRequests, estimatedCost
            } = req.body;

            const caterer = await Vendor.findById(catererId);
            if (!caterer) {
                return res.status(404).json({ success: false, message: 'Caterer not found' });
            }

            const bookingRequest = new BookingRequest({
                clientId: req.user._id,
                clientName: req.user.name,
                clientPhone: req.user.mobile,
                catererId,
                catererName: caterer.businessName,
                eventType,
                eventDate, // Already converted to Date by validator
                numGuests,
                eventLocation,
                venueType,
                mealPreference,
                selectedCuisine,
                selectedPackage,
                selectedLiveCounters,
                specialRequests,
                estimatedCost
            });

            await bookingRequest.save();

            res.status(201).json({
                success: true,
                data: bookingRequest,
                message: 'Booking request submitted successfully'
            });

        } catch (error) {
            console.error('Error creating booking request:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
);

// GET /api/booking/vendor/ongoing - Get ongoing (locked) bookings for vendor
router.get('/vendor/ongoing', protectVendor, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ 
      catererId: req.vendor._id,
      status: { $in: ['PENDING', 'PAYMENT_PENDING'] } ,
    }).sort({ createdAt: -1 });

    // Hide client contact details for locked requests
    const filteredBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      bookingObj.clientName = '*'.repeat(Math.min(bookingObj.clientName.length, 10));
      bookingObj.clientPhone = '*'.repeat(10);
      return bookingObj;
    });

    res.json({
      success: true,
      data: filteredBookings
    });

  } catch (error) {
    console.error('Error fetching vendor ongoing bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/booking/vendor/unlocked - Get unlocked bookings for vendor
router.get('/vendor/unlocked', protectVendor, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ 
      catererId: req.vendor._id,
      status: { $in: ['UNLOCKED', 'CONFIRMED', 'NOT_CONFIRMED'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching vendor unlocked bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// NEW: POST /api/booking/:id/initiate-unlock - Initiate unlock process
// FIXED: POST /api/booking/:bookingId/initiate-unlock - Initiate unlock process
router.post('/:bookingId/initiate-unlock', protectVendor, async (req, res) => {
  try {
    const { bookingId } = req.params; // Changed from 'id' to 'bookingId'
    
    // Find booking request
    const bookingRequest = await BookingRequest.findById(bookingId); // Changed from 'id' to 'bookingId'
    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    // Validate ownership
    if (bookingRequest.catererId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unlock this booking'
      });
    }

    // Validate status - Updated to include PAYMENT_PENDING
    if (!['PENDING', 'PAYMENT_PENDING'].includes(bookingRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    // Find vendor
    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if free unlock is available
    if (!vendor.free_unlock_used) {
      // FREE UNLOCK FLOW
      bookingRequest.status = 'UNLOCKED';
      bookingRequest.payment_status = 'NOT_APPLICABLE';
      bookingRequest.unlocked_at = new Date();
      
      vendor.free_unlock_used = true;
      vendor.free_unlock_used_at = new Date();
      vendor.last_unlock_date = new Date();
      
      await Promise.all([
        bookingRequest.save(),
        vendor.save()
      ]);

      // Return unlocked client details
      const unlockedBooking = await BookingRequest.findById(bookingId).populate('clientId', 'name contact email');
      
      return res.json({
        success: true,
        status: 'FREE_UNLOCK_SUCCESS',
        data: {
          booking: unlockedBooking,
          clientDetails: {
            name: unlockedBooking.clientName,
            phone: unlockedBooking.clientPhone,
            email: unlockedBooking.clientId?.email || 'N/A'
          }
        },
        message: 'Congratulations! Your first unlock is FREE!'
      });
    } else {
      // PAID UNLOCK FLOW
      const amount = bookingRequest.unlock_fee * 100; // Convert to paisa
      
      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: bookingRequest._id.toString(),
        notes: {
          vendorId: req.vendor._id.toString(),
          bookingId: bookingRequest._id.toString(),
          type: 'unlock_fee'
        }
      });

      // Update booking request
      bookingRequest.razorpay_order_id = razorpayOrder.id;
      bookingRequest.status = 'PAYMENT_PENDING';
      bookingRequest.payment_status = 'PENDING';
      
      await bookingRequest.save();

      return res.json({
        success: true,
        status: 'PAYMENT_REQUIRED',
        data: {
          order_id: razorpayOrder.id,
          amount: amount,
          currency: 'INR',
          key_id: process.env.RAZORPAY_KEY_ID,
          booking_id: bookingRequest._id
        },
        message: 'Payment required to unlock booking'
      });
    }

  } catch (error) {
    console.error('Error initiating unlock:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// NEW: POST /api/booking/payments/verify-razorpay - Verify Razorpay payment
router.post('/payments/verify-razorpay', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Find booking request
    const bookingRequest = await BookingRequest.findOne({ razorpay_order_id });
    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    if (expectedSignature === razorpay_signature) {
      // Payment verification successful
      bookingRequest.status = 'UNLOCKED';
      bookingRequest.payment_status = 'SUCCESS';
      bookingRequest.razorpay_payment_id = razorpay_payment_id;
      bookingRequest.razorpay_signature = razorpay_signature;
      bookingRequest.unlocked_at = new Date();
      
      // Update vendor stats
      const vendor = await Vendor.findById(bookingRequest.catererId);
      if (vendor) {
        vendor.total_unlocks_purchased += 1;
        vendor.total_revenue_generated += bookingRequest.unlock_fee;
        vendor.last_unlock_date = new Date();
        await vendor.save();
      }
      
      await bookingRequest.save();

      // Return unlocked client details
      const unlockedBooking = await BookingRequest.findById(bookingRequest._id).populate('clientId', 'name contact email');
      
      return res.json({
        success: true,
        status: 'PAYMENT_SUCCESS',
        data: {
          booking: unlockedBooking,
          clientDetails: {
            name: unlockedBooking.clientName,
            phone: unlockedBooking.clientPhone,
            email: unlockedBooking.clientId?.email || 'N/A'
          }
        },
        message: 'Payment successful! Booking unlocked.'
      });
    } else {
      // Payment verification failed
      bookingRequest.status = 'PAYMENT_FAILED';
      bookingRequest.payment_status = 'FAILED';
      await bookingRequest.save();
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// NEW: POST /api/booking/:id/update-final-status - Update final status
// FIXED: POST /api/booking/:bookingId/update-final-status - Update final status
router.post('/:bookingId/update-final-status', protectVendor, async (req, res) => {
  try {
    const { bookingId } = req.params; // Changed from 'id' to 'bookingId'
    const { finalStatus } = req.body;

    if (!['CONFIRMED', 'NOT_CONFIRMED'].includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid final status'
      });
    }

    const bookingRequest = await BookingRequest.findById(bookingId); // Changed from 'id' to 'bookingId'
    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    // Validate ownership
    if (bookingRequest.catererId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate current status
    if (bookingRequest.status !== 'UNLOCKED') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be unlocked first'
      });
    }

    // Update status
    bookingRequest.status = finalStatus;
    if (finalStatus === 'CONFIRMED') {
      bookingRequest.confirmed_at = new Date();
    } else {
      bookingRequest.not_confirmed_at = new Date();
    }

    await bookingRequest.save();

    res.json({
      success: true,
      data: bookingRequest,
      message: `Booking ${finalStatus.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('Error updating final status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// NEW: GET /api/booking/vendor/metrics -  Get vendor metrics
router.get('/vendor/metrics', protectVendor, async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    // Get counts for each status
    const [pendingCount, unlockedCount, confirmedCount, notConfirmedCount] = await Promise.all([
      BookingRequest.countDocuments({ catererId: vendorId, status: 'PENDING' }),
      BookingRequest.countDocuments({ catererId: vendorId, status: 'UNLOCKED' }),
      BookingRequest.countDocuments({ catererId: vendorId, status: 'CONFIRMED' }),
      BookingRequest.countDocuments({ catererId: vendorId, status: 'NOT_CONFIRMED' })
    ]);

    // Get vendor info for additional metrics
    const vendor = await Vendor.findById(vendorId);

    res.json({
      success: true,
      data: {
        totalPending: pendingCount,
        totalUnlocked: unlockedCount,
        totalConfirmed: confirmedCount,
        totalNotConfirmed: notConfirmedCount,
        freeUnlockUsed: vendor?.free_unlock_used || false,
        totalUnlocksPurchased: vendor?.total_unlocks_purchased || 0,
        totalRevenueGenerated: vendor?.total_revenue_generated || 0
      }
    });

  } catch (error) {
    console.error('Error fetching vendor metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// GET /api/booking/client - Get all bookings for logged-in client
router.get('/client', protect, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ clientId: req.user._id })
      .populate('catererId', 'businessName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching client bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/booking/cancel/:id - Cancel a booking request (only for pending status)
router.delete('/cancel/:id', protect, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Find the booking request
    const bookingRequest = await BookingRequest.findById(bookingId);
    
    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    // Check if the booking belongs to the logged-in client
    if (bookingRequest.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking request'
      });
    }

    // Check if the booking status is 'pending'
    if (bookingRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking request. Only pending requests can be cancelled.'
      });
    }

    // Delete the booking request
    await BookingRequest.findByIdAndDelete(bookingId);

    res.json({
      success: true,
      message: 'Booking request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ADMIN ROUTES

// GET /api/booking/admin/all - Get all booking requests for admin
router.get('/admin/all', protectAdmin, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({})
      .populate('clientId', 'name email contact')
      .populate('catererId', 'businessName email contact')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/booking/admin/unlock/:bookingId - Admin unlocks a booking
router.put('/admin/unlock/:bookingId', protectAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await BookingRequest.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    booking.status = 'unlocked';
    booking.unlockedByAdmin = req.admin._id;
    booking.unlockedByAdminAt = new Date();
    booking.updatedAt = new Date();

    await booking.save();

    res.json({
      success: true,
      data: booking,
      message: 'Booking unlocked successfully'
    });

  } catch (error) {
    console.error('Error unlocking booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/booking/admin/stats - Get booking statistics for admin
router.get('/admin/stats', protectAdmin, async (req, res) => {
  try {
    const totalBookings = await BookingRequest.countDocuments();
    const pendingBookings = await BookingRequest.countDocuments({ status: 'pending' });
    const unlockedBookings = await BookingRequest.countDocuments({ status: 'unlocked' });
    const confirmedBookings = await BookingRequest.countDocuments({ status: 'confirmed' });
    const rejectedBookings = await BookingRequest.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      data: {
        total: totalBookings,
        pending: pendingBookings,
        unlocked: unlockedBookings,
        confirmed: confirmedBookings,
        rejected: rejectedBookings
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

