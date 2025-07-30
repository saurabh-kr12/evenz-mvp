// File: routes/vendor/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const BookingRequest = require('../../models/admin/BookingRequest');
const Vendor = require('../../models/Vendor/Vendor');
const Availability = require('../../models/Vendor/Availability');
const { protect } = require('../../middleware/vendor/auth');

// @desc    Get caterer dashboard summary
// @route   GET /api/vendor/dashboard-summary
// @access  Private (Vendor)
const getDashboardSummary = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    // Calculate date 30 days ago for recent stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch vendor details (for name and unavailable dates)
    const vendor = await Vendor.findById(vendorId).select('businessName ownerName');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Perform all database queries in parallel for better performance
    const [
      pendingLeadsCount,
      inProgressLeadsCount,
      confirmedBookingsLast30Days,
      estimatedRevenueLast30Days,
      unavailableDaysCount,
      recentBookings
    ] = await Promise.all([
      // Count pending leads
      BookingRequest.countDocuments({
        catererId: vendorId,
        status: 'PENDING'
      }),

      // Count leads in progress (unlocked)
      BookingRequest.countDocuments({
        catererId: vendorId,
        status: 'UNLOCKED' || 'PAYMENT_PENDING'
      }),

      // Count confirmed bookings in last 30 days
      BookingRequest.countDocuments({
        catererId: vendorId,
        status: 'CONFIRMED',
        createdAt: { $gte: thirtyDaysAgo }
      }),

      // Calculate estimated revenue for confirmed bookings in last 30 days
      BookingRequest.aggregate([
        {
          $match: {
            catererId: vendorId,
            status: 'CONFIRMED',
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$estimatedCost' }
          }
        }
      ]),

      // Count unavailable days
      Availability.countDocuments({
        vendor: vendorId,
        isAvailable: false
      }),

      // Get recent bookings (latest 5, regardless of status)
      BookingRequest.find({
        catererId: vendorId
      })
      .select('eventType eventDate numGuests status estimatedCost clientName clientPhone createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
    ]);

    // Extract revenue total from aggregation result
    const totalRevenue = estimatedRevenueLast30Days.length > 0 
      ? estimatedRevenueLast30Days[0].totalRevenue 
      : 0;

    // Process recent bookings to blur sensitive data for pending requests
    const processedRecentBookings = recentBookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Blur client details for pending requests
      if (booking.status === 'pending') {
        bookingObj.clientName = '*'.repeat(Math.min(bookingObj.clientName.length, 10));
        bookingObj.clientPhone = '*'.repeat(10);
      }
      
      return {
        _id: bookingObj._id,
        eventType: bookingObj.eventType,
        eventDate: bookingObj.eventDate,
        numGuests: bookingObj.numGuests,
        status: bookingObj.status,
        estimatedCost: bookingObj.estimatedCost,
        clientName: bookingObj.clientName,
        clientPhone: bookingObj.clientPhone,
        createdAt: bookingObj.createdAt
      };
    });

    // Prepare response data
    const dashboardData = {
      catererName: vendor.businessName,
      ownerName: vendor.ownerName,
      pendingLeadsCount,
      inProgressLeadsCount,
      confirmedBookingsCount: confirmedBookingsLast30Days,
      estimatedRevenueLast30Days: totalRevenue,
      unavailableDaysCount,
      recentBookings: processedRecentBookings
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard summary retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving dashboard summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Mount the route
router.get('/dashboard-summary', protect, getDashboardSummary);

module.exports = router;