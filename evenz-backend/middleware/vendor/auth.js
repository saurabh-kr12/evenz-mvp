// File: middleware/vendor/auth.js
const jwt = require('jsonwebtoken');
const Vendor = require('../../models/Vendor/Vendor');

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find vendor by ID
    const vendor = await Vendor.findById(decoded.id);
  

    if (!vendor) {
      return res.status(401).json({ message: 'Not authorized, vendor not found' });
    }

    // Set vendor in request
    req.vendor = vendor;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };