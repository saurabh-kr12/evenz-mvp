// File: routes/vendor/menu.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // ADDED
const Menu = require('../../models/Vendor/Menu');
const { protect } = require('../../middleware/vendor/auth');

// Apply auth middleware to all routes
router.use(protect);

const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// @desc    Get vendor's menu data
// @route   GET /api/vendor/menu
// @access  Private (Vendor)
router.get('/', async (req, res) => {
  try {
    let menu = await Menu.findOne({ vendor: req.vendor._id });

    if (!menu) {
      // Create empty menu if doesn't exist
      menu = new Menu({
        vendor: req.vendor._id,
        cuisines: [],
        packages: new Map()
      });
      await menu.save();
    }

    // Convert Map to Object for JSON response
    const menuData = {
      _id: menu._id,
      vendor: menu.vendor,
      cuisines: menu.cuisines,
      packages: Object.fromEntries(menu.packages),
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt
    };

    res.status(200).json({
      success: true,
      data: menuData
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu data',
      error: error.message
    });
  }
});

// @desc    Save/Update cuisines
// @route   POST /api/vendor/menu/cuisines
// @access  Private (Vendor)
router.post('/cuisines',
  [ // ADDED: Sanitize each element in the cuisines array
    body('cuisines.*').matches(safeTextRegex).withMessage('Cuisine name contains invalid characters.').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req); // ADDED: Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { cuisines } = req.body;

      if (!cuisines || !Array.isArray(cuisines)) {
        return res.status(400).json({
          success: false,
          message: 'Cuisines array is required'
        });
      }

      let menu = await Menu.findOne({ vendor: req.vendor._id });

      if (!menu) {
        menu = new Menu({
          vendor: req.vendor._id,
          cuisines: [],
          packages: new Map()
        });
      }

      // Update cuisines
      menu.cuisines = cuisines;

      // Initialize packages Map for new cuisines
      cuisines.forEach(cuisine => {
        if (!menu.packages.has(cuisine)) {
          menu.packages.set(cuisine, []);
        }
      });

      // Remove packages for cuisines that are no longer selected
      const cuisinesToRemove = [];
      for (let cuisine of menu.packages.keys()) {
        if (!cuisines.includes(cuisine)) {
          cuisinesToRemove.push(cuisine);
        }
      }
      cuisinesToRemove.forEach(cuisine => {
        menu.packages.delete(cuisine);
      });

      await menu.save();

      res.status(200).json({
        success: true,
        message: 'Cuisines saved successfully',
        data: {
          cuisines: menu.cuisines,
          packages: Object.fromEntries(menu.packages)
        }
      });
    } catch (error) {
      console.error('Save cuisines error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save cuisines',
        error: error.message
      });
    }
  });

// @desc    Create new package
// @route   POST /api/vendor/menu/packages
// @access  Private (Vendor)
router.post('/packages',
  [ // ADDED: Validation and sanitization for all string inputs
    body('cuisine').matches(safeTextRegex).withMessage('Cuisine name contains invalid characters.').trim().escape(),
    body('name').not().isEmpty().withMessage('Package name is required.')
      .matches(safeTextRegex).withMessage('Package name contains invalid characters.')
      .trim().escape(),
    body('type').isIn(['veg', 'non-veg', 'both']).withMessage('Invalid package type.'),
    body('description').optional().matches(safeTextRegex).withMessage('Description contains invalid characters.').trim().escape(),
    body('pricePerPlate').isNumeric().withMessage('Price must be a valid number.')
  ],
  async (req, res) => {
    const errors = validationResult(req); // ADDED: Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { cuisine, name, type, description, pricePerPlate, itemCounts } = req.body;

      // Validation
      if (!cuisine || !name || !type || !pricePerPlate) {
        return res.status(400).json({
          success: false,
          message: 'Cuisine, name, type, and pricePerPlate are required'
        });
      }

      const menu = await Menu.findOne({ vendor: req.vendor._id });
      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found. Please save cuisines first.'
        });
      }

      if (!menu.cuisines.includes(cuisine)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cuisine. Please select from saved cuisines.'
        });
      }

      const packageData = {
        name: name.trim(),
        type: type.toLowerCase(),
        description: description ? description.trim() : '',
        pricePerPlate: Number(pricePerPlate),
        itemCounts: itemCounts || {
          starters: 0,
          mains: 0,
          breads: 0,
          beverages: 0,
          desserts: 0
        },
        menuItems: []
      };

      menu.addPackage(cuisine, packageData);
      await menu.save();

      // Get the newly created package (it will have an _id now)
      const packages = menu.packages.get(cuisine);
      const newPackage = packages[packages.length - 1];

      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: newPackage
      });
    } catch (error) {
      console.error('Create package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create package',
        error: error.message
      });
    }
  });

// @desc    Update package
// @route   PUT /api/vendor/menu/packages/:packageId
// @access  Private (Vendor)
router.put('/packages/:packageId',
  [ // ADDED: Optional validation and sanitization
    body('cuisine').matches(safeTextRegex).withMessage('Cuisine name contains invalid characters.').trim().escape(),
    body('name').optional().matches(safeTextRegex).withMessage('Package name contains invalid characters.').trim().escape(),
    body('description').optional().matches(safeTextRegex).withMessage('Description contains invalid characters.').trim().escape(),
    body('pricePerPlate').optional().isNumeric().withMessage('Price must be a number.'),
    body('type').optional().isString().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { packageId } = req.params;
      const { cuisine, name, type, description, pricePerPlate, itemCounts } = req.body;

      if (!cuisine) {
        return res.status(400).json({
          success: false,
          message: 'Cuisine is required'
        });
      }

      const menu = await Menu.findOne({ vendor: req.vendor._id });
      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      const updateData = {};
      if (name) updateData.name = name.trim();
      if (type) updateData.type = type.toLowerCase();
      if (description !== undefined) updateData.description = description.trim();
      if (pricePerPlate !== undefined) updateData.pricePerPlate = Number(pricePerPlate);
      if (itemCounts) updateData.itemCounts = itemCounts;

      menu.updatePackage(cuisine, packageId, updateData);
      await menu.save();

      // Find and return updated package
      const packages = menu.packages.get(cuisine);
      const updatedPackage = packages.find(pkg => pkg._id.toString() === packageId);

      res.status(200).json({
        success: true,
        message: 'Package updated successfully',
        data: updatedPackage
      });
    } catch (error) {
      console.error('Update package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update package',
        error: error.message
      });
    }
  });

// @desc    Delete package
// @route   DELETE /api/vendor/menu/packages/:packageId
// @access  Private (Vendor)
router.delete('/packages/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const { cuisine } = req.query;

    if (!cuisine) {
      return res.status(400).json({
        success: false,
        message: 'Cuisine query parameter is required'
      });
    }

    const menu = await Menu.findOne({ vendor: req.vendor._id });
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    menu.removePackage(cuisine, packageId);
    await menu.save();

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: error.message
    });
  }
});

// @desc    Add menu item to package
// @route   POST /api/vendor/menu/items
// @access  Private (Vendor)
router.post('/items',
  [ // ADDED: Validation and sanitization
    body('cuisine').isString().trim().escape(),
    body('packageId').isMongoId(),
    body('type').isString().trim().escape(),
    body('vegNonVeg').isString().trim().escape(),
    body('name').isString().trim().matches(/^[a-zA-Z0-9\s\-_,.()&]+$/).escape().withMessage('Invalid characters in name'),
    body('extraPrice').optional({ checkFalsy: true }).isNumeric().withMessage('Extra price must be a number')
  ],
  async (req, res) => {
    const errors = validationResult(req); // ADDED: Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { cuisine, packageId, type, vegNonVeg, name, extraPrice } = req.body;

      // Validation
      if (!cuisine || !packageId || !type || !vegNonVeg || !name) {
        return res.status(400).json({
          success: false,
          message: 'Cuisine, packageId, type, vegNonVeg, and name are required'
        });
      }

      const menu = await Menu.findOne({ vendor: req.vendor._id });
      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      const menuItemData = {
        type: type.toLowerCase(),
        vegNonVeg: vegNonVeg.toLowerCase(),
        name: name.trim(),
        extraPrice: extraPrice ? Number(extraPrice) : 0
      };

      menu.addMenuItem(cuisine, packageId, menuItemData);
      await menu.save();

      // Get the newly created menu item
      const packages = menu.packages.get(cuisine);
      const package = packages.find(pkg => pkg._id.toString() === packageId);
      const newMenuItem = package.menuItems[package.menuItems.length - 1];

      res.status(201).json({
        success: true,
        message: 'Menu item added successfully',
        data: newMenuItem
      });
    } catch (error) {
      console.error('Add menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add menu item',
        error: error.message
      });
    }
  });

// @desc    Update menu item
// @route   PUT /api/vendor/menu/items/:itemId
// @access  Private (Vendor)
router.put('/items/:itemId',
  [ // ADDED: Optional validation and sanitization
    body('cuisine').isString().trim().escape(),
    body('packageId').isMongoId(),
    body('type').optional().isString().trim().escape(),
    body('vegNonVeg').optional().isString().trim().escape(),
    body('name').optional().matches(safeTextRegex).withMessage('Item name contains invalid characters.').trim().escape(),
    body('extraPrice').optional().isNumeric().withMessage('Extra price must be a number.')
  ],
  async (req, res) => {
    const errors = validationResult(req); // ADDED: Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { itemId } = req.params;
      const { cuisine, packageId, type, vegNonVeg, name, extraPrice } = req.body;

      if (!cuisine || !packageId) {
        return res.status(400).json({
          success: false,
          message: 'Cuisine and packageId are required'
        });
      }

      const menu = await Menu.findOne({ vendor: req.vendor._id });
      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      const updateData = {};
      if (type) updateData.type = type.toLowerCase();
      if (vegNonVeg) updateData.vegNonVeg = vegNonVeg.toLowerCase();
      if (name) updateData.name = name.trim();
      if (extraPrice !== undefined) updateData.extraPrice = Number(extraPrice);

      menu.updateMenuItem(cuisine, packageId, itemId, updateData);
      await menu.save();

      // Find and return updated menu item
      const packages = menu.packages.get(cuisine);
      const package = packages.find(pkg => pkg._id.toString() === packageId);
      const updatedMenuItem = package.menuItems.find(item => item._id.toString() === itemId);

      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: updatedMenuItem
      });
    } catch (error) {
      console.error('Update menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu item',
        error: error.message
      });
    }
  });

// @desc    Delete menu item
// @route   DELETE /api/vendor/menu/items/:itemId
// @access  Private (Vendor)
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { cuisine, packageId } = req.query;

    if (!cuisine || !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Cuisine and packageId query parameters are required'
      });
    }

    const menu = await Menu.findOne({ vendor: req.vendor._id });
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    menu.removeMenuItem(cuisine, packageId, itemId);
    await menu.save();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
});

// @desc    Get package details
// @route   GET /api/vendor/menu/packages/:packageId
// @access  Private (Vendor)
router.get('/packages/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const { cuisine } = req.query;

    if (!cuisine) {
      return res.status(400).json({
        success: false,
        message: 'Cuisine query parameter is required'
      });
    }

    const menu = await Menu.findOne({ vendor: req.vendor._id });
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const packages = menu.packages.get(cuisine);
    if (!packages) {
      return res.status(404).json({
        success: false,
        message: 'Cuisine not found'
      });
    }

    const package = packages.find(pkg => pkg._id.toString() === packageId);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(200).json({
      success: true,
      data: package
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
      error: error.message
    });
  }
});

module.exports = router;