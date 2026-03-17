const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Authentication Middleware
 * Verifies JWT token and adds user info to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'grumble-secret-key'
    );

    // Check if user account is still active
    const userCheck = await pool.query(
      'SELECT id, username, account_status, is_deleted, frozen_reason FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = userCheck.rows[0];

    if (!user || user.is_deleted) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deleted. Please contact support.'
      });
    }

    if (user.account_status === 'frozen') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been frozen.',
        reason: user.frozen_reason
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;
