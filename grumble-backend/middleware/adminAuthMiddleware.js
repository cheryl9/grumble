const jwt = require('jsonwebtoken');
const { findAdminById } = require('../repositories/admin/adminRepository');

/**
 * Admin Authentication Middleware
 * Verifies admin JWT token and adds admin info to request
 * 
 * This is separate from user auth middleware for security isolation
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required. Please login to admin panel.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with ADMIN_JWT_SECRET (different from user JWT)
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-in-production'
    );

    // Ensure this is an admin token, not a user token
    if (decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token. Please use admin login.'
      });
    }

    // Verify admin still exists and is active
    const admin = await findAdminById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Admin account has been deactivated. Contact super admin.'
      });
    }

    // Add admin info to request
    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin session expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Admin authentication error'
    });
  }
};

/**
 * Require Superadmin Role
 * Use this middleware AFTER adminAuthMiddleware for superadmin-only routes
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Superadmin access required for this action'
    });
  }
  next();
};

module.exports = adminAuthMiddleware;
module.exports.requireSuperAdmin = requireSuperAdmin;
