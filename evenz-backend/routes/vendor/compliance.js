// File: routes/compliance.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Compliance = require('../../models/Vendor/Compliance');
const { protect } = require('../../middleware/vendor/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/compliance';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.vendor._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Get compliance data
router.get('/', protect, async (req, res) => {
  try {
    let compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance) {
      // Create default compliance record if none exists
      compliance = new Compliance({ vendorId: req.vendor._id });
      await compliance.save();
    }
    
    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update FSSAI License
router.put('/fssai', protect, async (req, res) => {
  try {
    const { number } = req.body;
    
    let compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance) {
      compliance = new Compliance({ vendorId: req.vendor._id });
    }
    
    compliance.fssaiLicense = {
      number: number || '',
      updatedAt: new Date()
    };
    
    await compliance.save();
    
    res.json({
      success: true,
      message: 'FSSAI license updated successfully',
      data: compliance.fssaiLicense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update FSSAI license',
      error: error.message
    });
  }
});

// Update Hygiene & Audits
router.put('/hygiene', protect, async (req, res) => {
  try {
    const { details } = req.body;
    
    let compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance) {
      compliance = new Compliance({ vendorId: req.vendor._id });
    }
    
    compliance.hygieneAudits = {
      details: details || '',
      updatedAt: new Date()
    };
    
    await compliance.save();
    
    res.json({
      success: true,
      message: 'Hygiene & audits updated successfully',
      data: compliance.hygieneAudits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update hygiene & audits',
      error: error.message
    });
  }
});

// Update Ingredient Sourcing
router.put('/ingredients', protect, async (req, res) => {
  try {
    const { details } = req.body;
    
    let compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance) {
      compliance = new Compliance({ vendorId: req.vendor._id });
    }
    
    compliance.ingredientSourcing = {
      details: details || '',
      updatedAt: new Date()
    };
    
    await compliance.save();
    
    res.json({
      success: true,
      message: 'Ingredient sourcing updated successfully',
      data: compliance.ingredientSourcing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update ingredient sourcing',
      error: error.message
    });
  }
});

// Update Allergen Handling
router.put('/allergens', protect, async (req, res) => {
  try {
    const { details } = req.body;
    
    let compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance) {
      compliance = new Compliance({ vendorId: req.vendor._id });
    }
    
    compliance.allergenHandling = {
      details: details || '',
      updatedAt: new Date()
    };
    
    await compliance.save();
    
    res.json({
      success: true,
      message: 'Allergen handling updated successfully',
      data: compliance.allergenHandling
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update allergen handling',
      error: error.message
    });
  }
});

// Update Insurance
router.put('/insurance', protect, upload.single('document'), async (req, res) => {
  try {
    const { provided, details } = req.body;
    
    let compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance) {
      compliance = new Compliance({ vendorId: req.vendor._id });
    }
    
    // Delete old document if exists and new one is uploaded
    if (req.file && compliance.insurance.document && compliance.insurance.document.path) {
      try {
        fs.unlinkSync(compliance.insurance.document.path);
      } catch (err) {
        console.log('Failed to delete old document:', err.message);
      }
    }
    
    compliance.insurance = {
      provided: provided === 'true' || provided === true,
      details: details || '',
      updatedAt: new Date()
    };
    
    if (req.file) {
      compliance.insurance.document = {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    
    await compliance.save();
    
    res.json({
      success: true,
      message: 'Insurance information updated successfully',
      data: compliance.insurance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update insurance information',
      error: error.message
    });
  }
});

// Download insurance document
router.get('/insurance/document', protect, async (req, res) => {
  try {
    const compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance || !compliance.insurance.document || !compliance.insurance.document.path) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    const filePath = compliance.insurance.document.path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    res.download(filePath, compliance.insurance.document.filename);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
});

// Delete insurance document
router.delete('/insurance/document', protect, async (req, res) => {
  try {
    const compliance = await Compliance.findOne({ vendorId: req.vendor._id });
    
    if (!compliance || !compliance.insurance.document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete file from filesystem
    if (compliance.insurance.document.path && fs.existsSync(compliance.insurance.document.path)) {
      fs.unlinkSync(compliance.insurance.document.path);
    }
    
    // Remove document info from database
    compliance.insurance.document = undefined;
    compliance.insurance.updatedAt = new Date();
    await compliance.save();
    
    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: compliance.insurance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

module.exports = router;
