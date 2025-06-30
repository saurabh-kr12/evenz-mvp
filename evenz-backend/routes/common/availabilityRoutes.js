// File: routes/public/availabilityRoutes.js
const express = require('express');
const router = express.Router();
const Availability = require('../../models/Vendor/Availability');
const Vendor = require('../../models/Vendor/Vendor');

// @desc    Check vendor availability for a specific date (Public endpoint)
// @route   GET /api/public/availability/:vendorId/:date
// @access  Public
const checkVendorAvailability = async (req, res) => {
  try {
    const { vendorId, date } = req.params;

    // Validate vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Validate date format and create proper date object
    const targetDate = new Date(date + 'T00:00:00.000Z'); // Force UTC timezone
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    console.log('Target date being searched:', targetDate);
    console.log('Vendor ID being searched:', vendorId);

    // Find availability record for the date
    const availability = await Availability.findOne({
      vendor: vendorId,
      date: targetDate
    });

    console.log('Availability record found:', availability);

    // Show unavailable only if explicitly marked as unavailable in database
    // If no record exists or isAvailable is true, show as available
    const isAvailable = availability ? availability.isAvailable : true;
    const notes = availability ? availability.notes : '';
    
    console.log('Final availability status:', isAvailable);

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        isAvailable,
        notes,
        vendorName: vendor.businessName,
        ownerName: vendor.ownerName,
        vendorId: vendor._id
      },
      message: 'Availability check completed successfully'
    });

  } catch (error) {
    console.error('Error in checkVendorAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability'
    });
  }
};

router.get('/:vendorId/:date', checkVendorAvailability);

module.exports = router;