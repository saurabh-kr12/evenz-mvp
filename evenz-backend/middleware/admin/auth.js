// server/middleware/admin/auth.js
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin/Admin');

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin by ID
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Admin not found.' 
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Account deactivated.' 
      });
    }

    if (admin.isLocked) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Account temporarily locked.' 
      });
    }

    // Set admin in request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. Invalid token.' 
    });
  }
};

module.exports = { protect };