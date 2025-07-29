const Vendor = require('../../models/Vendor/Vendor');
const jwt = require('jsonwebtoken');

const generateToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe ? '60d' : '7d';
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn
  });
};

// Login vendor
const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe = false } = req.body;

    // Find vendor by email or mobile
    const vendor = await Vendor.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    }).select('+password');

    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await vendor.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token with appropriate expiration
    const token = generateToken(vendor._id, rememberMe);

    // Update last login time
    vendor.updatedAt = new Date();
    await vendor.save();

    // Return success response
    res.status(200).json({
      _id: vendor._id,
      ownerName: vendor.ownerName,
      email: vendor.email,
      mobile: vendor.mobile,
      businessName: vendor.businessName,
      token,
      expiresIn: rememberMe ? '60d' : '7d'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = {
  login,
};