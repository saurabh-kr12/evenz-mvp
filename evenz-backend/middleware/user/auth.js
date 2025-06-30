// server/middleware/auth.js
const { verifyToken } = require('../../utils/auth');
const User = require('../../models/User/User');

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

    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect };

// middleware/auth.js


// const jwt = require('jsonwebtoken');
// const User = require('../../models/User/User');

// const authMiddleware = async (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.header('Authorization');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Access denied. No token provided.' });
//     }

//     const token = authHeader.substring(7); // Remove 'Bearer ' prefix

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
//     // Check if user still exists
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid token. User not found.' });
//     }

//     // Add user info to request
//     req.user = decoded;
//     req.userDoc = user;
    
//     next();
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ message: 'Invalid token.' });
//     } else if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ message: 'Token expired.' });
//     }
    
//     console.error('Auth middleware error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// module.exports = authMiddleware;