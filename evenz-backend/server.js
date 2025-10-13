// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // ADDED: For security headers
const mongoSanitize = require('express-mongo-sanitize'); // ADDED: For input sanitization
const cookieParser = require('cookie-parser');

const envResult = dotenv.config();

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

// Initialize Express app
const app = express();

app.set('trust proxy', 1);

// --- Security Middleware Stack (Order is important!) ---

// 1. Set various security HTTP headers
app.use(helmet()); // ADDED

// 2. Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter); // CHANGED: Uncommented and activated

// 3. Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // ADDED: limit to prevent payload attacks
app.use(cookieParser()); // ADDED: To parse cookies, especially for JWTs

// 4. Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // ADDED

// 5. Configure CORS to only allow your frontends
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g., http://localhost:3000
  'https://evenz.in', // Your future client production URL
  'http://localhost:3001' , // Local development for vendors
  'http://localhost:3000' , // Local development for clients
  'https://evenz-caterers.vercel.app',
  'https://evenz-mvp.vercel.app'  // vercel app
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
})); // CHANGED: Made CORS restrictive

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// --- API Routes ---
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/shortlist',shortlist)
app.use('/api/vendor/auth', vendorAuthRoutes)
app.use('/api/register', require('./routes/vendor/vendorRegistration'));
app.use('/api/vendor-profile', vendorProfileUpdateRoutes)
app.use('/api/vendor/menu', vendorMenuRoutes);
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


// --- Error Handling ---
app.use((err, req, res, next) => {
  // CHANGED: Refined error handling
  console.error(err.stack);
  
  // In production, don't leak error details
  if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ success: false, message: 'Something went wrong!' });
  }
  // In development, send more details
  res.status(500).json({ 
    success: false, 
    message: err.message, 
    stack: err.stack 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});