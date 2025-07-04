// server/routes/bookings.js
const express = require('express');
const router = express.Router();
const BookingRequest = require('../../models/admin/BookingRequest');
const Vendor = require('../../models/Vendor/Vendor');
const Admin = require('../../models/Admin/Admin'); // You'll need to create this model
const { protect } = require('../../middleware/user/auth');
const { protect: protectVendor } = require('../../middleware/vendor/auth');
const { protect: protectAdmin } = require('../../middleware/admin/auth'); // You'll need to create this

// POST /api/booking/booking-requests
router.post('/booking-requests', protect, async (req, res) => {
  try {
    const {
      catererId,
      eventType,
      eventDate,
      numGuests,
      eventLocation,
      venueType,
      mealPreference,
      selectedCuisine,
      selectedPackage,
      selectedLiveCounters = [],
      specialRequests,
      estimatedCost
    } = req.body;

    // Server-side validation
    if (!catererId || !eventType || !eventDate || !numGuests || !eventLocation || 
        !mealPreference || !selectedCuisine || !selectedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Fetch caterer details for validation
    const caterer = await Vendor.findById(catererId);
    if (!caterer) {
      return res.status(404).json({
        success: false,
        message: 'Caterer not found'
      });
    }

    // Create booking request
    const bookingRequest = new BookingRequest({
      clientId: req.user._id,
      clientName: req.user.name,
      clientPhone: req.user.contact,
      catererId,
      catererName: caterer.businessName,
      eventType,
      eventDate: new Date(eventDate),
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
    if (bookingRequest.status !== 'pending') {
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

// GET /api/booking/vendor/ongoing - Get ongoing (locked) bookings for vendor
router.get('/vendor/ongoing', protectVendor, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ 
      catererId: req.vendor._id,
      status: 'pending'
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
      status: { $in: ['unlocked', 'confirmed', 'rejected'] }
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

// POST /api/booking/vendor/request-unlock - Request to unlock a booking
router.post('/vendor/request-unlock', protectVendor, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await BookingRequest.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    if (booking.catererId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unlock this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    // In a real app, you might want to create a notification record
    // For now, we'll just return success - admin will handle manually
    
    res.json({
      success: true,
      message: 'Unlock request sent to admin. You will be contacted for payment.'
    });

  } catch (error) {
    console.error('Error requesting unlock:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/booking/vendor/confirm/:bookingId - Confirm or reject unlocked booking
router.put('/vendor/confirm/:bookingId', protectVendor, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body; // status: 'confirmed' or 'rejected'

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await BookingRequest.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    if (booking.catererId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this booking'
      });
    }

    if (booking.status !== 'unlocked') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be unlocked first'
      });
    }

    booking.status = status;
    if (notes) booking.vendorNotes = notes;
    booking.updatedAt = new Date();

    await booking.save();

    res.json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
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