// File: controllers/vendor/availabilityController.js
const { validationResult } = require('express-validator');
const Availability = require('../../models/Vendor/Availability');

// @desc    Get vendor availability for a month/date range
// @route   GET /api/vendor/availability
// @access  Private (Vendor)
const getAvailability = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { month, year, startDate, endDate } = req.query;

    let start, end;

    if (month && year) {
      // Get specific month
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0);
    } else if (startDate && endDate) {
      // Get custom date range
      start = new Date(startDate + 'T00:00:00.000Z');
      end = new Date(endDate + 'T23:59:59.999Z');
    } else {
      // Default to current month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Ensure end date includes full day
    end.setHours(23, 59, 59, 999);

    const availability = await Availability.getVendorAvailability(vendorId, start, end);

    // Convert to object format for frontend
    const availabilityMap = {};
    availability.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      availabilityMap[dateKey] = {
        isAvailable: item.isAvailable,
        notes: item.notes,
        updatedAt: item.updatedAt
      };
    });

    res.json({
      success: true,
      data: availabilityMap,
      message: 'Availability retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving availability'
    });
  }
};

// @desc    Get availability for a specific date
// @route   GET /api/vendor/availability/:date
// @access  Private (Vendor)
const getDateAvailability = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { date } = req.params;

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const availability = await Availability.findOne({
      vendor: vendorId,
      date: targetDate
    });

    res.json({
      success: true,
      data: availability ? {
        isAvailable: availability.isAvailable,
        notes: availability.notes,
        updatedAt: availability.updatedAt
      } : {
        isAvailable: true,
        notes: '',
        updatedAt: null
      },
      message: 'Date availability retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getDateAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving date availability'
    });
  }
};

// @desc    Save/Update vendor availability
// @route   POST /api/vendor/availability
// @access  Private (Vendor)
const saveAvailability = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.vendor._id;
    const { availability, bulkUpdate } = req.body;

    if (bulkUpdate && Array.isArray(bulkUpdate)) {
      // Handle bulk update
      const updates = bulkUpdate.map(item => ({
        date: new Date(item.date + (item.date.includes('T') ? '' : 'T00:00:00.000Z')), // Add this check
        isAvailable: item.isAvailable,
        notes: item.notes || ''
      }));

      await Availability.bulkUpdateAvailability(vendorId, updates);

      return res.json({
        success: true,
        message: `Successfully updated ${updates.length} dates`,
        updatedCount: updates.length
      });
    }

    if (availability && typeof availability === 'object') {
      // Handle single/multiple date updates from calendar format
      const updates = [];
      
      for (const [dateKey, data] of Object.entries(availability)) {
        const date = new Date(dateKey + 'T00:00:00.000Z'); // Ensure date is in UTC format
        if (!isNaN(date.getTime())) {
          updates.push({
            date,
            isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
            notes: data.notes || ''
          });
        }
      }

      if (updates.length > 0) {
        await Availability.bulkUpdateAvailability(vendorId, updates);
        
        return res.json({
          success: true,
          message: `Successfully updated ${updates.length} date(s)`,
          updatedCount: updates.length
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: 'No valid availability data provided'
    });

  } catch (error) {
    console.error('Error in saveAvailability:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate date entry detected'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while saving availability'
    });
  }
};

// @desc    Delete vendor availability entries
// @route   DELETE /api/vendor/availability
// @access  Private (Vendor)
const deleteAvailability = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { dates, all } = req.body;

    let result;

    if (all) {
      // Delete all availability entries for vendor
      result = await Availability.deleteMany({ vendor: vendorId });
    } else if (dates && Array.isArray(dates)) {
      // Delete specific dates
      const datesToDelete = dates.map(date => new Date(date));
      result = await Availability.deleteMany({
        vendor: vendorId,
        date: { $in: datesToDelete }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No dates specified for deletion'
      });
    }

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} availability entries`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error in deleteAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting availability'
    });
  }
};

// @desc    Get availability summary/statistics
// @route   GET /api/vendor/availability/summary
// @access  Private (Vendor)
const getAvailabilitySummary = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { month, year } = req.query;

    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();

    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0);
    end.setHours(23, 59, 59, 999);

    const summary = await Availability.aggregate([
      {
        $match: {
          vendor: vendorId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          availableDays: {
            $sum: { $cond: ['$isAvailable', 1, 0] }
          },
          unavailableDays: {
            $sum: { $cond: ['$isAvailable', 0, 1] }
          }
        }
      }
    ]);

    const stats = summary[0] || {
      totalDays: 0,
      availableDays: 0,
      unavailableDays: 0
    };

    res.json({
      success: true,
      data: {
        ...stats,
        month: targetMonth + 1,
        year: targetYear,
        availabilityRate: stats.totalDays > 0 ? 
          Math.round((stats.availableDays / stats.totalDays) * 100) : 0
      },
      message: 'Availability summary retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getAvailabilitySummary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving availability summary'
    });
  }
};

module.exports = {
  getAvailability,
  getDateAvailability,
  saveAvailability,
  deleteAvailability,
  getAvailabilitySummary
};