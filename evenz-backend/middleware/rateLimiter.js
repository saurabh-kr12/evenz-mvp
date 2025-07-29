// 3. Rate Limiter Middleware (middleware/rateLimiter.js)
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  registrationLimiter: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    10, // 10 requests per window
    'Too many registration attempts, please try again later.'
  ),
  
  otpLimiter: createRateLimiter(
    60 * 1000, // 1 minute
    3, // 3 requests per minute
    'Too many OTP requests, please try again later.'
  )
};