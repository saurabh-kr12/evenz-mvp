// File: config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const CloudinaryStorage  = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vendor/experience', // Folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [
      {
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto:good'
      }
    ],
    public_id: (req, file) => {
      // Generate unique public ID with vendor ID and timestamp
      return `vendor_${req.vendor._id}_${Date.now()}`;
    },
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1 // Maximum 1 file
  }
});

module.exports = {
  cloudinary,
  upload
};