const userManagementRepository = require('../../repositories/admin/userManagementRepository');

/**
 * User Management Controller
 * Handles admin user management API requests
 */

/**
 * Get users with filters and pagination
 * GET /api/admin/users?page=1&limit=20&search=&status=active&sortBy=created_at&sortOrder=DESC
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, status, sortBy, sortOrder } = req.query;
    
    const filters = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search: search || '',
      status: status || 'all',
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'DESC'
    };

    const result = await userManagementRepository.getUsers(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details by ID
 * GET /api/admin/users/:id
 */
const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get user basic info
    const user = await userManagementRepository.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user stats
    const stats = await userManagementRepository.getUserStats(id);
    
    // Get recent posts
    const recentPosts = await userManagementRepository.getUserPosts(id, 5);
    
    // Get friends
    const friends = await userManagementRepository.getUserFriends(id);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        stats,
        recentPosts,
        friends
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Freeze user account
 * PATCH /api/admin/users/:id/freeze
 * Body: { reason: string }
 */
const freezeUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required to freeze an account'
      });
    }

    if (reason.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Reason must be at least 10 characters long'
      });
    }

    const result = await userManagementRepository.freezeUser(id, reason, adminId);

    res.json({
      success: true,
      message: 'User account frozen successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'User not found or already deleted') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Unfreeze user account
 * PATCH /api/admin/users/:id/unfreeze
 */
const unfreezeUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const result = await userManagementRepository.unfreezeUser(id, adminId);

    res.json({
      success: true,
      message: 'User account unfrozen successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'User not found or already deleted') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Delete user account (soft delete, superadmin only)
 * DELETE /api/admin/users/:id
 * Body: { reason: string } (optional)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;

    // Check if user is superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can delete user accounts'
      });
    }

    const result = await userManagementRepository.deleteUser(id, adminId, reason || '');

    res.json({
      success: true,
      message: 'User account deleted successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'User not found or already deleted') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Search users
 * GET /api/admin/users/search?q=query
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const results = await userManagementRepository.searchUsers(q, 20);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserDetails,
  freezeUser,
  unfreezeUser,
  deleteUser,
  searchUsers
};
