/**
 * Rate Limiting Middleware for Admin Panel Security
 * Prevents brute force attacks on login
 */

// Simple in-memory rate limiter (use Redis for production)
const attempts = {};

/**
 * Rate limiter middleware
 * Tracks login attempts by IP/username combo
 */
function createRateLimiter(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const key = `${req.ip}-${req.body.username || 'unknown'}`;
    const now = Date.now();

    // Clean old entries
    if (attempts[key] && now - attempts[key].firstAttempt > windowMs) {
      delete attempts[key];
    }

    // Initialize or increment attempts
    if (!attempts[key]) {
      attempts[key] = { count: 1, firstAttempt: now };
    } else {
      attempts[key].count++;
    }

    // Check if exceeded
    if (attempts[key].count > maxAttempts) {
      const resetTime = new Date(attempts[key].firstAttempt + windowMs).toISOString();
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again after ${Math.ceil((attempts[key].firstAttempt + windowMs - now) / 1000)} seconds.`,
        resetTime
      });
    }

    // Warn if approaching limit
    if (attempts[key].count >= maxAttempts - 1) {
      res.set('X-RateLimit-Remaining', maxAttempts - attempts[key].count);
      res.set('X-RateLimit-Reset', resetTime);
    }

    next();
  };
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  Object.keys(attempts).forEach(key => {
    if (now - attempts[key].firstAttempt > windowMs) {
      delete attempts[key];
    }
  });
}, 5 * 60 * 1000); // Clean every 5 minutes

module.exports = {
  createRateLimiter
};
