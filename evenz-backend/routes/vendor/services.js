// File: routes/services.js
const express = require('express');
const router = express.Router();
const Services = require('../../models/Vendor/Services');
const { protect } = require('../../middleware/vendor/auth');

// Helper function to process custom options
const processCustomOptions = (sectionData) => {
  if (!sectionData || !sectionData.other) return sectionData;
  
  // If "other" is selected and has a specification, convert it to a custom option
  if (sectionData.other.selected && sectionData.other.specification && sectionData.other.specification.trim()) {
    const specification = sectionData.other.specification.trim();
    
    // Initialize customOptions if it doesn't exist
    if (!sectionData.customOptions) {
      sectionData.customOptions = [];
    }
    
    // Check if this specification already exists in customOptions
    const existingOption = sectionData.customOptions.find(
      option => option.specification.toLowerCase() === specification.toLowerCase()
    );
    
    if (!existingOption) {
      // Add new custom option
      sectionData.customOptions.push({
        specification: specification,
        selected: true
      });
    } else {
      // Update existing option to selected
      existingOption.selected = true;
    }
    
    // Clear the "other" field after moving to custom options
    sectionData.other = {
      selected: false,
      specification: ''
    };
  }
  
  return sectionData;
};

// @desc    Get vendor services
// @route   GET /api/services
// @access  Private (Vendor)
router.get('/', protect, async (req, res) => {
  try {
    let services = await Services.findOne({ vendor: req.vendor._id });
    // Create default services if none exist
    if (!services) {
      services = new Services({ vendor: req.vendor._id });
      await services.save();
    }
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error while fetching services' });
  }
});

// @desc    Update vendor services
// @route   PUT /api/services
// @access  Private (Vendor)
router.put('/', protect, async (req, res) => {
  try {
    const {
      mealServiceTypes,
      liveCounters,
      staffDetails,
      tableware,
      setupBreakdownProcess,
      deliveryLogistics,
      availableForEvents,
      staffProvided,
      waterService
    } = req.body;

    let services = await Services.findOne({ vendor: req.vendor._id });
    
    if (!services) {
      services = new Services({ vendor: req.vendor._id });
    }
    
    // Update fields with custom option processing
    if (mealServiceTypes !== undefined) {
      services.mealServiceTypes = processCustomOptions(mealServiceTypes);
    }
    if (liveCounters !== undefined) services.liveCounters = liveCounters;
    if (staffDetails !== undefined) services.staffDetails = staffDetails;
    if (tableware !== undefined) {
      services.tableware = processCustomOptions(tableware);
    }
    if (setupBreakdownProcess !== undefined) services.setupBreakdownProcess = setupBreakdownProcess;
    if (deliveryLogistics !== undefined) services.deliveryLogistics = deliveryLogistics;
    if (availableForEvents !== undefined) {
      services.availableForEvents = processCustomOptions(availableForEvents);
    }
    if (staffProvided !== undefined) services.staffProvided = staffProvided;
    if (waterService !== undefined) services.waterService = waterService;

    await services.save();
    
    res.json({
      message: 'Services updated successfully',
      services
    });
  } catch (error) {
    console.error('Error updating services:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error while updating services' });
  }
});

// @desc    Add live counter
// @route   POST /api/services/live-counters
// @access  Private (Vendor)
router.post('/live-counters', protect, async (req, res) => {
  try {
    const { name, description, pricePerPlate } = req.body;
    console.log("name",name)
    if (!name || !description || pricePerPlate === undefined) {
      return res.status(400).json({ 
        message: 'Name, description, and price per plate are required' 
      });
    }

    let services = await Services.findOne({ vendor: req.vendor._id });
    
    if (!services) {
      services = new Services({ vendor: req.vendor._id });
    }

    services.liveCounters.push({ name, description, pricePerPlate });
    await services.save();
    
    res.json({
      message: 'Live counter added successfully',
      liveCounter: services.liveCounters[services.liveCounters.length - 1]
    });
  } catch (error) {
    console.error('Error adding live counter:', error);
    res.status(500).json({ message: 'Server error while adding live counter' });
  }
});

// @desc    Update live counter
// @route   PUT /api/services/live-counters/:id
// @access  Private (Vendor)
router.put('/live-counters/:id', protect, async (req, res) => {
  try {
    const { name, description, pricePerPlate } = req.body;

    const services = await Services.findOne({ vendor: req.vendor._id });
    
    if (!services) {
      return res.status(404).json({ message: 'Services not found' });
    }

    const liveCounter = services.liveCounters.id(req.params.id);
    
    if (!liveCounter) {
      return res.status(404).json({ message: 'Live counter not found' });
    }

    if (name !== undefined) liveCounter.name = name;
    if (description !== undefined) liveCounter.description = description;
    if (pricePerPlate !== undefined) liveCounter.pricePerPlate = pricePerPlate;

    await services.save();
    
    res.json({
      message: 'Live counter updated successfully',
      liveCounter
    });
  } catch (error) {
    console.error('Error updating live counter:', error);
    res.status(500).json({ message: 'Server error while updating live counter' });
  }
});

// @desc    Delete live counter
// @route   DELETE /api/services/live-counters/:id
// @access  Private (Vendor)
router.delete('/live-counters/:id', protect, async (req, res) => {
  try {
    const services = await Services.findOne({ vendor: req.vendor._id });
    
    if (!services) {
      return res.status(404).json({ message: 'Services not found' });
    }

    const liveCounterIndex = services.liveCounters.findIndex(
      counter => counter._id.toString() === req.params.id
    );
    
    if (liveCounterIndex === -1) {
      return res.status(404).json({ message: 'Live counter not found' });
    }

    services.liveCounters.splice(liveCounterIndex, 1);
    await services.save();
    
    res.json({ message: 'Live counter deleted successfully' });
  } catch (error) {
    console.error('Error deleting live counter:', error);
    res.status(500).json({ message: 'Server error while deleting live counter' });
  }
});

module.exports = router;