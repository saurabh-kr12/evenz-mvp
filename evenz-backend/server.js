// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const envResult = dotenv.config();
const path = require('path');
const rateLimit = require('express-rate-limit');

const userAuthRoutes = require('./routes/user/auth');
const vendorAuthRoutes = require('./routes/vendor/auth')
const vendorProfileUpdateRoutes = require('./routes/vendor/vendor')
const vendorMenuRoutes = require('./routes/vendor/menu'); // Add menu routes
const serviceRoutes = require('./routes/vendor/services')
const customizationRoutes = require('./routes/vendor/customization')
const complianceRoutes = require('./routes/vendor/compliance')
const legalRoutes = require('./routes/vendor/legal')
const mediaRoutes = require('./routes/vendor/media')
const availabilityRoutes = require('./routes/vendor/availability')
const searchRoutes = require('./routes/common/searchRoutes');
const caterersDetails = require('./routes/common/getCatererPf')
const shortlist = require('./routes/user/shortlist')
const bookingRoutes = require('./routes/user/bookings')
const adminRoutes = require('./routes/admin/auth')
const vendorDashboardRoutes = require('./routes/vendor/dashboardRoutes');

// Load environment variables

// Debug environment loading
if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
} else {
  console.log('Environment variables loaded successfully');
}

// Debug specific environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.resolve('.env'));
// Add this after dotenv.config() in your server.js
console.log('Fast2SMS API Key check:', process.env.FAST2SMS_API_KEY ? 'Set' : 'Not set');
console.log('Fast2SMS API Key length:', process.env.FAST2SMS_API_KEY?.length || 0);

// Initialize Express app
const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
// app.use(limiter);
app.use(express.json());
app.use(cors());

// Serve uploaded files statically (with authentication in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/shortlist',shortlist)
app.use('/api/vendor/auth', vendorAuthRoutes)
app.use('/api/register', require('./routes/vendor/vendorRegistration')); // Use vendor registration routes
app.use('/api/vendor-profile', vendorProfileUpdateRoutes)
app.use('/api/vendor/menu', vendorMenuRoutes); // Add menu routes
app.use('/api/vendor/services', serviceRoutes);
app.use('/api/vendor/customization', customizationRoutes);
app.use('/api/vendor/compliance', complianceRoutes);
app.use('/api/vendor/legal', legalRoutes);
app.use('/api/vendor/experience', mediaRoutes);
app.use('/api/vendor/availability', availabilityRoutes);
app.use('/api/vendor/dashboard', vendorDashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/caterers-details',caterersDetails)
app.use('/api/public/availability', require('./routes/common/availabilityRoutes'));
app.use('/api/booking',bookingRoutes);
app.use('/api/admin',adminRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});