// File:  routes/compliance.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Compliance = require('../../models/Vendor/Compliance');
const { protect } = require('../../middleware/vendor/auth');

const router = express.Router();

// Whitelist for safe text input to prevent XSS. Allows letters, numbers, spaces, and common punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;
// Stricter regex for license numbers.
const alphaNumericRegex = /^[a-zA-Z0-9]*$/;

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
router.put('/fssai', protect,
  [
    body('number').matches(alphaNumericRegex).withMessage('FSSAI number must be alphanumeric.').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
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

// Generic updater for details-based sections
const createDetailsUpdater = (sectionName, successMessage) => {
    return [
        protect,
        [ body('details').matches(safeTextRegex).withMessage('Invalid characters detected.').trim().escape() ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }
            try {
                const { details } = req.body;
                const update = { $set: { [`${sectionName}.details`]: details, [`${sectionName}.updatedAt`]: new Date() } };
                const compliance = await Compliance.findOneAndUpdate({ vendorId: req.vendor._id }, update, { new: true, upsert: true });
                res.json({ success: true, message: successMessage, data: compliance[sectionName] });
            } catch (error) {
                res.status(500).json({ success: false, message: `Failed to update ${sectionName}`, error: error.message });
            }
        }
    ];
};

// Update Hygiene & Audits
router.put('/hygiene', ...createDetailsUpdater('hygieneAudits', 'Hygiene & audits updated successfully'));

// Update Ingredient Sourcing
router.put('/ingredients', ...createDetailsUpdater('ingredientSourcing', 'Ingredient sourcing updated successfully'));

// Update Allergen Handling
router.put('/allergens', ...createDetailsUpdater('allergenHandling', 'Allergen handling updated successfully'));

// Update Insurance (no file upload)
router.put(
    '/insurance',
    protect,
    [
        body('provided').isBoolean(),
        body('details').matches(safeTextRegex).withMessage('Invalid characters detected.').trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        try {
            const { provided, details } = req.body;
            const update = {
                $set: {
                    'insurance.provided': provided,
                    'insurance.details': details,
                    'insurance.updatedAt': new Date()
                }
            };
            const compliance = await Compliance.findOneAndUpdate({ vendorId: req.vendor._id }, update, { new: true, upsert: true });
            res.json({ success: true, message: 'Insurance information updated successfully', data: compliance.insurance });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to update insurance information', error: error.message });
        }
    }
);


module.exports = router;
