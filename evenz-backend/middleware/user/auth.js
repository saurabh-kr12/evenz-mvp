// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../../models/User/User');

// Fixed verifyToken function
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { 
      valid: true, 
      userId: decoded.userId, 
      role: decoded.role,
      // Include the full decoded payload
      ...decoded
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in the authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded.valid) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }

    // Add debug logging
    console.log('Decoded token:', decoded);
    console.log('Looking for user ID:', decoded.userId);

    // Get user from the token - Use decoded.userId (not decoded.id)
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found with ID:', decoded.userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User found:', user.name, user.email);

    // Set user in request object with the correct structure
    req.user = {
      userId: user._id,
      ...user.toObject()
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect, verifyToken };