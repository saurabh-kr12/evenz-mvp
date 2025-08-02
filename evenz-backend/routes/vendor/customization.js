// File:  routes/vendor/customization.js
const express = require('express');
const router = express.Router();
const Customization = require('../../models/Vendor/Customization');
const { body, validationResult } = require('express-validator');
const { protect } = require('../../middleware/vendor/auth');

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation. It blocks characters like < and >.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// @desc    Get customization preferences
// @route   GET /api/vendor/customization
// @access  Private (Vendor)
router.get('/', protect, async (req, res) => {
  try {
    let customization = await Customization.findOne({ vendor: req.vendor._id });

    // If no customization record exists, create one with defaults
    if (!customization) {
      customization = new Customization({
        vendor: req.vendor._id
      });
      await customization.save();
    }

    res.json({
      success: true,
      data: customization
    });
  } catch (error) {
    console.error('Get customization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customization preferences'
    });
  }
});

// @desc    Update customization preferences (full update)
// @route   PUT /api/vendor/customization
// @access  Private (Vendor)
router.put('/', protect, async (req, res) => {
  try {
    const {
      allowCustomization,
      customizationCharges,
      specialMenus,
      dietaryFilters,
      tastingSession
    } = req.body;

    // Validate customization charges
    if (allowCustomization && customizationCharges?.hasCharges) {
      if (!customizationCharges.chargeType || !['per_plate', 'fixed'].includes(customizationCharges.chargeType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid charge type. Must be either "per_plate" or "fixed"'
        });
      }
      if (customizationCharges.amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Charge amount cannot be negative'
        });
      }
    }

    // Validate dietary filters custom values
    if (dietaryFilters?.custom) {
      const validValues = dietaryFilters.custom.filter(val =>
        typeof val === 'string' && val.trim().length > 0
      );
      dietaryFilters.custom = [...new Set(validValues)]; // Remove duplicates
    }

    // Build update object
    const updateData = {};

    if (typeof allowCustomization === 'boolean') {
      updateData.allowCustomization = allowCustomization;
    }

    if (customizationCharges) {
      updateData.customizationCharges = {
        hasCharges: customizationCharges.hasCharges || false,
        chargeType: customizationCharges.chargeType || 'per_plate',
        amount: customizationCharges.amount || 0
      };
    }

    if (typeof specialMenus === 'string') {
      updateData.specialMenus = specialMenus.trim();
    }

    if (dietaryFilters) {
      updateData.dietaryFilters = {
        vegan: dietaryFilters.vegan || false,
        jain: dietaryFilters.jain || false,
        vegetarian: dietaryFilters.vegetarian || false,
        glutenFree: dietaryFilters.glutenFree || false,
        diabeticFriendly: dietaryFilters.diabeticFriendly || false,
        lowSodium: dietaryFilters.lowSodium || false,
        custom: dietaryFilters.custom || []
      };
    }

    if (tastingSession) {
      updateData.tastingSession = {
        allowed: tastingSession.allowed || false,
        description: tastingSession.description?.trim() || ''
      };
    }

    // Find and update or create
    const customization = await Customization.findOneAndUpdate(
      { vendor: req.vendor._id },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Customization preferences updated successfully',
      data: customization
    });
  } catch (error) {
    console.error('Update customization error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating customization preferences'
    });
  }
});

// @desc    Update specific customization section
// @route   PATCH /api/vendor/customization/:section
// @access  Private (Vendor)
router.patch('/:section', protect,
  [ // ADDED: Validation and Sanitization Middleware
    body('specialMenus').optional().matches(safeTextRegex).withMessage('Invalid characters in special menus description.').trim().escape(),
    body('tastingSession.description').optional().matches(safeTextRegex).withMessage('Invalid characters in tasting session description.').trim().escape(),
    body('dietaryFilters.custom.*').optional().matches(safeTextRegex).withMessage('Invalid characters in custom filter.').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req); // ADDED: Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { section } = req.params;
      const allowedSections = ['customization', 'dietary', 'tasting'];

      if (!allowedSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid section. Allowed sections: customization, dietary, tasting'
        });
      }

      let updateData = {};
      let sectionMessage = '';

      switch (section) {
        case 'customization':
          const { allowCustomization, customizationCharges, specialMenus } = req.body;

          // Validate customization charges
          if (allowCustomization && customizationCharges?.hasCharges) {
            if (!customizationCharges.chargeType || !['per_plate', 'fixed'].includes(customizationCharges.chargeType)) {
              return res.status(400).json({
                success: false,
                message: 'Invalid charge type. Must be either "per_plate" or "fixed"'
              });
            }
            if (customizationCharges.amount < 0) {
              return res.status(400).json({
                success: false,
                message: 'Charge amount cannot be negative'
              });
            }
          }

          if (typeof allowCustomization === 'boolean') {
            updateData.allowCustomization = allowCustomization;
          }

          if (customizationCharges) {
            updateData.customizationCharges = {
              hasCharges: customizationCharges.hasCharges || false,
              chargeType: customizationCharges.chargeType || 'per_plate',
              amount: customizationCharges.amount || 0
            };
          }

          if (typeof specialMenus === 'string') {
            updateData.specialMenus = specialMenus.trim();
          }

          sectionMessage = 'Menu customization preferences updated successfully';
          break;

        case 'dietary':
          const { dietaryFilters } = req.body;

          if (!dietaryFilters) {
            return res.status(400).json({
              success: false,
              message: 'Dietary filters data is required'
            });
          }

          // Validate and clean custom values
          if (dietaryFilters.custom) {
            const validValues = dietaryFilters.custom.filter(val =>
              typeof val === 'string' && val.trim().length > 0
            );
            dietaryFilters.custom = [...new Set(validValues)]; // Remove duplicates
          }

          updateData.dietaryFilters = {
            vegan: dietaryFilters.vegan || false,
            jain: dietaryFilters.jain || false,
            vegetarian: dietaryFilters.vegetarian || false,
            glutenFree: dietaryFilters.glutenFree || false,
            diabeticFriendly: dietaryFilters.diabeticFriendly || false,
            lowSodium: dietaryFilters.lowSodium || false,
            custom: dietaryFilters.custom || []
          };

          sectionMessage = 'Dietary filter preferences updated successfully';
          break;

        case 'tasting':
          const { tastingSession } = req.body;

          if (!tastingSession) {
            return res.status(400).json({
              success: false,
              message: 'Tasting session data is required'
            });
          }

          updateData.tastingSession = {
            allowed: tastingSession.allowed || false,
            description: tastingSession.description?.trim() || ''
          };

          sectionMessage = 'Tasting session preferences updated successfully';
          break;
      }

      // Find and update or create
      const customization = await Customization.findOneAndUpdate(
        { vendor: req.vendor._id },
        updateData,
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );

      res.json({
        success: true,
        message: sectionMessage,
        data: customization
      });
    } catch (error) {
      console.error(`Update ${req.params.section} section error:`, error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: `Server error while updating ${req.params.section} preferences`
      });
    }
  });

// @desc    Delete customization preferences (reset to defaults)
// @route   DELETE /api/vendor/customization
// @access  Private (Vendor)
router.delete('/', protect, async (req, res) => {
  try {
    await Customization.findOneAndDelete({ vendor: req.vendor._id });

    // Create new default record
    const defaultCustomization = new Customization({
      vendor: req.vendor._id
    });
    await defaultCustomization.save();

    res.json({
      success: true,
      message: 'Customization preferences reset to defaults',
      data: defaultCustomization
    });
  } catch (error) {
    console.error('Delete customization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting customization preferences'
    });
  }
});

// @desc    Reset specific section to defaults
// @route   DELETE /api/vendor/customization/:section
// @access  Private (Vendor)
router.delete('/:section', protect, async (req, res) => {
  try {
    const { section } = req.params;
    const allowedSections = ['customization', 'dietary', 'tasting'];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section. Allowed sections: customization, dietary, tasting'
      });
    }

    let updateData = {};
    let sectionMessage = '';

    switch (section) {
      case 'customization':
        updateData = {
          allowCustomization: false,
          customizationCharges: {
            hasCharges: false,
            chargeType: 'per_plate',
            amount: 0
          },
          specialMenus: ''
        };
        sectionMessage = 'Menu customization preferences reset to defaults';
        break;

      case 'dietary':
        updateData = {
          dietaryFilters: {
            vegan: false,
            jain: false,
            vegetarian: false,
            glutenFree: false,
            diabeticFriendly: false,
            lowSodium: false,
            custom: []
          }
        };
        sectionMessage = 'Dietary filter preferences reset to defaults';
        break;

      case 'tasting':
        updateData = {
          tastingSession: {
            allowed: false,
            description: ''
          }
        };
        sectionMessage = 'Tasting session preferences reset to defaults';
        break;
    }

    // Find and update or create
    const customization = await Customization.findOneAndUpdate(
      { vendor: req.vendor._id },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: sectionMessage,
      data: customization
    });
  } catch (error) {
    console.error(`Reset ${req.params.section} section error:`, error);
    res.status(500).json({
      success: false,
      message: `Server error while resetting ${req.params.section} preferences`
    });
  }
});

module.exports = router;