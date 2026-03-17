const adminRepository = require('../../repositories/admin/adminRepository');
const jwt = require('jsonwebtoken');

/**
 * Admin Auth Controller
 * Handles admin login, logout, and session management
 */

/**
 * Admin login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }
    
    // Verify credentials
    const admin = await adminRepository.verifyAdminCredentials(username, password);
    
    if (!admin) {
      // Don't reveal whether username or password is wrong (security best practice)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account is inactive'
      });
    }
    
    // Update last login timestamp
    await adminRepository.updateLastLogin(admin.id);
    
    // Generate JWT token (separate from user tokens)
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        role: admin.role,
        type: 'admin' // Important: distinguish from user tokens
      },
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-in-production',
      { expiresIn: process.env.ADMIN_SESSION_DURATION || '4h' }
    );
    
    // Log successful login
    await adminRepository.logAdminAction(
      admin.id,
      'admin_login',
      'admin',
      admin.id,
      { username: admin.username },
      req.ip || req.connection.remoteAddress
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current admin profile
 */
const getCurrentAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin.id; // From auth middleware
    
    const admin = await adminRepository.findAdminById(adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role,
          lastLoginAt: admin.last_login_at,
          createdAt: admin.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin logout (client-side handles token removal)
 */
const logout = async (req, res, next) => {
  try {
    const adminId = req.admin.id;
    
    // Log logout action
    await adminRepository.logAdminAction(
      adminId,
      'admin_logout',
      'admin',
      adminId,
      { username: req.admin.username },
      req.ip || req.connection.remoteAddress
    );
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin activity logs
 */
const getAdminLogs = async (req, res, next) => {
  try {
    const { adminId, action, page = 1, limit = 50 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {
      adminId: adminId ? parseInt(adminId) : null,
      action,
      limit: parseInt(limit),
      offset
    };
    
    const [logs, totalCount] = await Promise.all([
      adminRepository.getAdminLogs(filters),
      adminRepository.getAdminLogsCount(filters)
    ]);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all admins (superadmin only)
 */
const getAllAdmins = async (req, res, next) => {
  try {
    // Check if requester is superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Superadmin access required'
      });
    }
    
    const admins = await adminRepository.getAllAdmins();
    
    res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change admin password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    // Get admin with password hash
    const admin = await adminRepository.findAdminById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const verified = await adminRepository.verifyPassword(currentPassword, admin.password_hash);
    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await adminRepository.updateAdminPassword(adminId, newPassword);

    // Log password change
    await adminRepository.logAdminAction(
      adminId,
      'admin_password_changed',
      'admin',
      adminId,
      { username: admin.username },
      req.ip || req.connection.remoteAddress
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getCurrentAdmin,
  logout,
  getAdminLogs,
  getAllAdmins,
  changePassword
};
