// File: routes/vendor/experience.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../../middleware/vendor/auth');
const Media = require('../../models/Vendor/media');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/vendor/experience';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 20 // Maximum 20 files
  }
});

// @desc    Get vendor's experience media
// @route   GET /api/vendor/experience
// @access  Private (Vendor)
router.get('/', protect, async (req, res) => {
  try {
    const mediaItems = await Media.find({ vendor: req.vendor._id }).sort({ uploadedAt: -1 });
    
    res.json({
      success: true,
      data: mediaItems
    });
  } catch (error) {
    console.error('Error fetching experience media:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get vendor's cover image
// @route   GET /api/vendor/experience/cover
// @access  Private (Vendor)
router.get('/cover', protect, async (req, res) => {
  try {
    const coverImage = await Media.findOne({ 
      vendor: req.vendor._id, 
      isCoverImage: true 
    });
    
    res.json({
      success: true,
      data: coverImage
    });
  } catch (error) {
    console.error('Error fetching cover image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Set cover image
// @route   PUT /api/vendor/experience/cover/:mediaId
// @access  Private (Vendor)
router.put('/cover/:mediaId', protect, async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    // Find and verify the media belongs to the authenticated vendor
    const mediaItem = await Media.findOne({ 
      _id: mediaId, 
      vendor: req.vendor._id 
    });

    if (!mediaItem) {
      return res.status(404).json({ message: 'Media not found or unauthorized' });
    }

    // Remove cover image status from all other images of this vendor
    await Media.updateMany(
      { vendor: req.vendor._id },
      { $set: { isCoverImage: false } }
    );

    // Set this image as cover image
    mediaItem.isCoverImage = true;
    await mediaItem.save();

    res.json({
      success: true,
      message: 'Cover image updated successfully',
      data: mediaItem
    });

  } catch (error) {
    console.error('Error setting cover image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Remove cover image
// @route   DELETE /api/vendor/experience/cover
// @access  Private (Vendor)
router.delete('/cover', protect, async (req, res) => {
  try {
    // Remove cover image status from all images of this vendor
    await Media.updateMany(
      { vendor: req.vendor._id },
      { $set: { isCoverImage: false } }
    );

    res.json({
      success: true,
      message: 'Cover image removed successfully'
    });

  } catch (error) {
    console.error('Error removing cover image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Upload experience media
// @route   POST /api/vendor/experience/upload
// @access  Private (Vendor)
router.post('/upload', protect, upload.array('photos', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Check current media count for this vendor
    const currentMediaCount = await Media.countDocuments({ vendor: req.vendor._id });
    const newFilesCount = req.files.length;
    
    if (currentMediaCount + newFilesCount > 20) {
      // Delete uploaded files since we're rejecting the request
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      
      return res.status(400).json({ 
        message: `Cannot upload ${newFilesCount} files. Maximum 20 photos allowed. You currently have ${currentMediaCount} photos.` 
      });
    }

    // Check if vendor has any existing media (for auto-setting first image as cover)
    const hasExistingMedia = currentMediaCount > 0;

    // Process uploaded files and create media documents
    const mediaDocuments = req.files.map((file, index) => ({
      vendor: req.vendor._id,
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      isCoverImage: !hasExistingMedia && index === 0, // Set first image as cover if no existing media
      uploadedAt: new Date()
    }));

    // Save to database
    const savedMedia = await Media.insertMany(mediaDocuments);

    res.status(201).json({
      success: true,
      message: `${newFilesCount} photo(s) uploaded successfully`,
      data: savedMedia
    });

  } catch (error) {
    console.error('Error uploading experience media:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      });
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum 5MB per file.' });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum 20 files allowed.' });
      }
    }

    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @desc    Delete experience media
// @route   DELETE /api/vendor/experience/:mediaId
// @access  Private (Vendor)
router.delete('/:mediaId', protect, async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    // Find and verify the media belongs to the authenticated vendor
    const mediaItem = await Media.findOne({ 
      _id: mediaId, 
      vendor: req.vendor._id 
    });

    if (!mediaItem) {
      return res.status(404).json({ message: 'Media not found or unauthorized' });
    }

    const wasCoverImage = mediaItem.isCoverImage;

    // Delete file from filesystem
    try {
      if (fs.existsSync(mediaItem.path)) {
        fs.unlinkSync(mediaItem.path);
      }
    } catch (fileError) {
      console.error('Error deleting file from filesystem:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Remove from database
    await Media.findByIdAndDelete(mediaId);

    // If deleted image was cover image, set the most recent remaining image as cover
    if (wasCoverImage) {
      const nextCoverImage = await Media.findOne({ vendor: req.vendor._id }).sort({ uploadedAt: -1 });
      if (nextCoverImage) {
        nextCoverImage.isCoverImage = true;
        await nextCoverImage.save();
      }
    }

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting experience media:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Serve uploaded images
// @route   GET /api/vendor/experience/image/:filename
// @access  Public (for displaying images)
router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '../../../uploads/vendor/experience', filename);
  
  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ message: 'Image not found' });
  }

  res.sendFile(path.resolve(imagePath));
});

module.exports = router;