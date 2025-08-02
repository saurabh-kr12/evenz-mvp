// File:routes/vendor/experience.js
const express = require('express');
const { protect } = require('../../middleware/vendor/auth');
const Media = require('../../models/Vendor/media');
const { body, validationResult } = require('express-validator');
const { cloudinary, upload } = require('../../config/cloudinary');

const router = express.Router();

// @desc    Get vendor's profile (image and experience)
// @route   GET /api/vendor/experience
// @access  Private (Vendor)
router.get('/', protect, async (req, res) => {
  try {
    const profile = await Media.findVendorProfile(req.vendor._id);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get vendor's profile image
// @route   GET /api/vendor/experience/image
// @access  Private (Vendor)
router.get('/image', protect, async (req, res) => {
  try {
    const profile = await Media.findVendorProfile(req.vendor._id);

    if (!profile) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        cloudinaryUrl: profile.cloudinaryUrl,
        originalName: profile.originalName,
        uploadedAt: profile.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Upload/Update profile image and experience
// @route   POST /api/vendor/experience/upload
// @access  Private (Vendor)
router.post('/upload', protect, upload.single('photo'),
  [ // ADDED: Validation for the experience field
    body('experience').isFloat({ min: 0 }).withMessage('Please provide a valid, non-negative experience value.')
  ],
  async (req, res) => {
    const errors = validationResult(req); // ADDED: Check for validation errors
    if (!errors.isEmpty()) {
      // If validation fails, delete any uploaded file
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { experience } = req.body;

      // Validate experience
      if (!experience || isNaN(experience) || parseFloat(experience) < 0) {
        // If file was uploaded, delete it from Cloudinary
        if (req.file) {
          await cloudinary.uploader.destroy(req.file.public_id);
        }
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid experience value (number of years)'
        });
      }

      const experienceValue = parseFloat(experience);

      // Check if vendor already has a profile
      const existingProfile = await Media.findVendorProfile(req.vendor._id);

      if (existingProfile && req.file) {
        // Delete old image from Cloudinary
        try {
          await cloudinary.uploader.destroy(existingProfile.cloudinaryPublicId);
        } catch (cloudinaryError) {
          console.error('Error deleting old image from Cloudinary:', cloudinaryError);
          // Continue with the update even if old image deletion fails
        }
      }

      // Prepare profile data
      const profileData = {
        vendor: req.vendor._id,
        experience: experienceValue
      };

      // Add image data if uploaded
      if (req.file) {
        profileData.cloudinaryUrl = req.file.path;
        profileData.cloudinaryPublicId = req.file.public_id;
        profileData.originalName = req.file.originalname;
        profileData.size = req.file.bytes;
        profileData.mimetype = req.file.mimetype;
        profileData.uploadedAt = new Date();
      }

      // Update or create profile
      const updatedProfile = await Media.updateVendorProfile(req.vendor._id, profileData);

      res.status(existingProfile ? 200 : 201).json({
        success: true,
        message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
        data: updatedProfile
      });

    } catch (error) {
      console.error('Error uploading profile:', error);

      // Clean up uploaded file on error
      if (req.file) {
        try {
          await cloudinary.uploader.destroy(req.file.public_id);
        } catch (cloudinaryError) {
          console.error('Error deleting file from Cloudinary:', cloudinaryError);
        }
      }

      if (error.name === 'MulterError') {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum 5MB per file.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Only one file allowed.' });
        }
      }

      res.status(500).json({ message: 'Server error during profile upload' });
    }
  });

// @desc    Update experience only
// @route   PUT /api/vendor/experience
// @access  Private (Vendor)
router.put('/', protect,
  [ // ADDED: Validation for the experience field
    body('experience').isFloat({ min: 0 }).withMessage('Please provide a valid, non-negative experience value.')
  ],
  async (req, res) => {
    const errors = validationResult(req); // ADDED: Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { experience } = req.body;

      // Validate experience
      if (!experience || isNaN(experience) || parseFloat(experience) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid experience value (number of years)'
        });
      }

      const experienceValue = parseFloat(experience);

      // Find existing profile
      const existingProfile = await Media.findVendorProfile(req.vendor._id);

      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found. Please upload a profile image first.'
        });
      }

      // Update only experience
      const updatedProfile = await Media.updateVendorProfile(req.vendor._id, {
        experience: experienceValue
      });

      res.json({
        success: true,
        message: 'Experience updated successfully',
        data: updatedProfile
      });

    } catch (error) {
      console.error('Error updating experience:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });

// @desc    Update profile image only
// @route   PUT /api/vendor/experience/image
// @access  Private (Vendor)
router.put('/image', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image to upload'
      });
    }

    // Find existing profile
    const existingProfile = await Media.findVendorProfile(req.vendor._id);

    if (!existingProfile) {
      // Delete uploaded file since we're rejecting the request
      await cloudinary.uploader.destroy(req.file.public_id);
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please create profile with experience first.'
      });
    }

    // Delete old image from Cloudinary
    try {
      await cloudinary.uploader.destroy(existingProfile.cloudinaryPublicId);
    } catch (cloudinaryError) {
      console.error('Error deleting old image from Cloudinary:', cloudinaryError);
      // Continue with the update even if old image deletion fails
    }

    // Update profile with new image
    const updatedProfile = await Media.updateVendorProfile(req.vendor._id, {
      cloudinaryUrl: req.file.path,
      cloudinaryPublicId: req.file.public_id,
      originalName: req.file.originalname,
      size: req.file.bytes,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error updating profile image:', error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.public_id);
      } catch (cloudinaryError) {
        console.error('Error deleting file from Cloudinary:', cloudinaryError);
      }
    }

    res.status(500).json({ message: 'Server error during image update' });
  }
});

// @desc    Delete profile image (keep experience)
// @route   DELETE /api/vendor/experience/image
// @access  Private (Vendor)
router.delete('/image', protect, async (req, res) => {
  try {
    const existingProfile = await Media.findVendorProfile(req.vendor._id);

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if there's any image data to delete
    if (!existingProfile.cloudinaryUrl && !existingProfile.cloudinaryPublicId) {
      return res.status(400).json({
        success: false,
        message: 'No image to delete'
      });
    }

    // Delete image from Cloudinary if publicId exists
    if (existingProfile.cloudinaryPublicId) {
      try {
        const deleteResult = await cloudinary.uploader.destroy(existingProfile.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with database update even if Cloudinary deletion fails
      }
    }

    // Update the document to remove image fields but keep experience
    const updatedProfile = await Media.findOneAndUpdate(
      { vendor: req.vendor._id },
      {
        $unset: {
          cloudinaryUrl: 1,
          cloudinaryPublicId: 1,
          originalName: 1,
          size: 1,
          mimetype: 1
        }
      },
      {
        new: true,
        runValidators: false // Skip validation since we're unsetting fields
      }
    );

    res.json({
      success: true,
      message: 'Profile image deleted successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete entire profile (image and experience)
// @route   DELETE /api/vendor/experience
// @access  Private (Vendor)
router.delete('/', protect, async (req, res) => {
  try {
    const existingProfile = await Media.findVendorProfile(req.vendor._id);

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Delete image from Cloudinary if exists
    if (existingProfile.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(existingProfile.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await Media.findByIdAndDelete(existingProfile._id);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get experience only
// @route   GET /api/vendor/experience/get-experience
// @access  Private (Vendor)
router.get('/get-experience', protect, async (req, res) => {
  try {
    const profile = await Media.findVendorProfile(req.vendor._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No experience data found for this vendor',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Experience data retrieved successfully',
      data: {
        experience: profile.experience,
        vendor: profile.vendor,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in get-experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Legacy route for adding experience (now handled by upload route)
// @desc    Add or update experience
// @route   POST /api/vendor/experience/add-experience
// @access  Private (Vendor)
router.post('/add-experience', protect, async (req, res) => {
  try {
    const { experience } = req.body;

    // Validate experience value
    if (!experience || typeof experience !== 'number' || experience < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid experience value (number of years)'
      });
    }

    // Update or create profile with experience only
    const updatedProfile = await Media.updateVendorProfile(req.vendor._id, {
      vendor: req.vendor._id,
      experience: experience
    });

    return res.status(200).json({
      success: true,
      message: updatedProfile.createdAt === updatedProfile.updatedAt ? 'Experience added successfully' : 'Experience updated successfully',
      data: {
        experience: updatedProfile.experience,
        vendor: updatedProfile.vendor,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in add-experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;