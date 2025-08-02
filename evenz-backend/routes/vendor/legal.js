// File:  routes/vendor/legal.js
const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const Legal = require('../../models/Vendor/legal');
const { protect } = require('../../middleware/vendor/auth');

const router = express.Router();

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/vendor/${req.vendor._id}/legal`;

    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document formats
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// @route   GET /api/vendor/legal
// @desc    Get legal & payment info for vendor
// @access  Private (Vendor)
router.get('/', protect, async (req, res) => {
  try {
    let legal = await Legal.findOne({ vendor: req.vendor._id });

    if (!legal) {
      // Create default legal document if none exists
      legal = new Legal({
        vendor: req.vendor._id,
        acceptedPaymentModes: {
          upi: false,
          cash: false,
          card: false,
          netBanking: false,
          wallet: false
        },
        bookingAdvance: {
          type: 'percentage',
          value: 0
        },
        minimumNoticeDays: 1
      });
      await legal.save();
    }

    res.json({
      success: true,
      message: 'Legal & payment information retrieved successfully',
      data: legal
    });
  } catch (error) {
    console.error('Error fetching legal info:', error);
    res.status(500).json({ message: 'Server error while fetching legal information' });
  }
});

// @route   PUT /api/vendor/legal
// @desc    Update legal & payment info
// @access  Private (Vendor)
router.put('/',
  protect,
  [ // ADDED: Validation and Sanitization
    body('gstRegistrationNumber')
      .optional({ checkFalsy: true }) // Allows empty strings
      .isAlphanumeric().withMessage('GST number must be alphanumeric.')
      .isLength({ min: 15, max: 15 }).withMessage('GST number must be 15 characters.')
      .trim().escape(),
    body('cancellationRefundPolicy')
      .optional()
      .matches(safeTextRegex).withMessage('Invalid characters in cancellation policy.')
      .trim().escape(),
    body('minGuests').optional().isInt({ min: 1 }).withMessage('Minimum guests must be a positive number.'),
    body('maxGuests').optional().isInt({ min: 1 }).withMessage('Maximum guests must be a positive number.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const {
        gstRegistrationNumber,
        acceptedPaymentModes,
        bookingAdvance,
        minGuests,
        maxGuests,
        minimumNoticeDays,
        cancellationRefundPolicy
      } = req.body;

      // Validation
      if (bookingAdvance?.value < 0) {
        return res.status(400).json({ message: 'Booking advance value cannot be negative' });
      }

      if (minGuests && maxGuests && minGuests > maxGuests) {
        return res.status(400).json({ message: 'Minimum guests cannot be greater than maximum guests' });
      }

      let legal = await Legal.findOne({ vendor: req.vendor._id });

      if (!legal) {
        legal = new Legal({ vendor: req.vendor._id });
      }

      // Update fields
      if (gstRegistrationNumber !== undefined) legal.gstRegistrationNumber = gstRegistrationNumber;
      if (acceptedPaymentModes) legal.acceptedPaymentModes = acceptedPaymentModes;
      if (bookingAdvance) legal.bookingAdvance = bookingAdvance;
      if (minGuests !== undefined) legal.minGuests = minGuests;
      if (maxGuests !== undefined) legal.maxGuests = maxGuests;
      if (minimumNoticeDays !== undefined) legal.minimumNoticeDays = minimumNoticeDays;
      if (cancellationRefundPolicy !== undefined) legal.cancellationRefundPolicy = cancellationRefundPolicy;

      await legal.save();

      res.json({
        success: true,
        message: 'Legal & payment information updated successfully',
        legal
      });
    } catch (error) {
      console.error('Error updating legal info:', error);
      res.status(500).json({ message: 'Server error while updating legal information' });
    }
  });

// @route   POST /api/vendor/legal/upload-certificates
// @desc    Upload certificate files
// @access  Private (Vendor)
router.post('/upload-certificates', protect, upload.array('certificates', 5), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    let legal = await Legal.findOne({ vendor: req.vendor._id });

    if (!legal) {
      legal = new Legal({ vendor: req.vendor._id });
    }

    // Add new certificates
    const newCertificates = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date()
    }));

    legal.certificates.push(...newCertificates);
    await legal.save();

    res.json({
      message: `${req.files.length} certificate(s) uploaded successfully`,
      files: newCertificates.map(cert => ({
        filename: cert.filename,
        originalName: cert.originalName,
        size: cert.size
      }))
    });
  } catch (error) {
    console.error('Error uploading certificates:', error);
    res.status(500).json({ message: 'Server error while uploading certificates' });
  }
});

// @route   DELETE /api/vendor/legal/certificate/:filename
// @desc    Delete a certificate file
// @access  Private (Vendor)
router.delete('/certificate/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;

    const legal = await Legal.findOne({ vendor: req.vendor._id });

    if (!legal) {
      return res.status(404).json({ message: 'Legal information not found' });
    }

    const certificateIndex = legal.certificates.findIndex(cert => cert.filename === filename);

    if (certificateIndex === -1) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Delete file from filesystem
    const certificate = legal.certificates[certificateIndex];
    try {
      fs.unlinkSync(certificate.path);
    } catch (err) {
      console.log('Error deleting certificate file:', err.message);
    }

    // Remove from database
    legal.certificates.splice(certificateIndex, 1);
    await legal.save();

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ message: 'Server error while deleting certificate' });
  }
});


// Backend fixes
// @route   POST /api/vendor/legal/upload-agreement
// @desc    Upload agreement/contract file
// @access  Private (Vendor)
router.post('/upload-agreement', protect, upload.single('agreement'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let legal = await Legal.findOne({ vendor: req.vendor._id });

    if (!legal) {
      legal = new Legal({ vendor: req.vendor._id });
    }

    // Delete old agreement file if exists
    if (legal.agreementContract?.path) {
      try {
        const fs = require('fs');
        if (fs.existsSync(legal.agreementContract.path)) {
          fs.unlinkSync(legal.agreementContract.path);
        }
      } catch (err) {
        console.log('Error deleting old agreement file:', err.message);
      }
    }

    // Save new agreement info
    legal.agreementContract = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedAt: new Date()
    };

    await legal.save();

    res.status(200).json({
      message: 'Agreement uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading agreement:', error);
    // Delete uploaded file if database save fails
    if (req.file?.path) {
      try {
        const fs = require('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.log('Error cleaning up file:', err.message);
      }
    }
    res.status(500).json({ message: 'Server error while uploading agreement' });
  }
});

// @route   DELETE /api/vendor/legal/agreement
// @desc    Delete agreement file
// @access  Private (Vendor)
router.delete('/agreement', protect, async (req, res) => {
  try {
    const legal = await Legal.findOne({ vendor: req.vendor._id });

    if (!legal || !legal.agreementContract) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Delete file from filesystem
    try {
      const fs = require('fs');
      if (fs.existsSync(legal.agreementContract.path)) {
        fs.unlinkSync(legal.agreementContract.path);
      }
    } catch (err) {
      console.log('Error deleting agreement file:', err.message);
    }

    // Remove from database using unset
    legal.agreementContract = undefined;
    legal.markModified('agreementContract'); // Ensure MongoDB recognizes the change
    await legal.save();

    res.status(200).json({ message: 'Agreement deleted successfully' });
  } catch (error) {
    console.error('Error deleting agreement:', error);
    res.status(500).json({ message: 'Server error while deleting agreement' });
  }
});

module.exports = router;