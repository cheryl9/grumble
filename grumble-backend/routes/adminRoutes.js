const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/admin/adminAuthController');
const dashboardController = require('../controllers/admin/dashboardController');
const userManagementController = require('../controllers/admin/userManagementController');
const postManagementController = require('../controllers/admin/postManagementController');
const reportController = require('../controllers/admin/reportController');
const faqController = require('../controllers/admin/faqController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * Admin Routes
 * All routes are prefixed with /api/admin
 */

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 * @security Rate limited to 5 attempts per 15 minutes
 */
router.post('/login', createRateLimiter(5, 15 * 60 * 1000), adminAuthController.login);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

// Apply admin auth middleware to all routes below
router.use(adminAuthMiddleware);

/**
 * @route   GET /api/admin/me
 * @desc    Get current admin profile
 * @access  Protected (Admin)
 */
router.get('/me', adminAuthController.getCurrentAdmin);

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout (logs the action)
 * @access  Protected (Admin)
 */
router.post('/logout', adminAuthController.logout);

/**
 * @route   GET /api/admin/logs
 * @desc    Get admin activity logs
 * @access  Protected (Admin)
 * @query   ?adminId=1&action=user_deleted&page=1&limit=50
 */
router.get('/logs', adminAuthController.getAdminLogs);

/**
 * @route   GET /api/admin/admins
 * @desc    Get all admin accounts
 * @access  Protected (Superadmin only)
 */
router.get('/admins', adminAuthController.getAllAdmins);

/**
 * @route   POST /api/admin/change-password
 * @desc    Change admin password
 * @access  Protected (Admin)
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password', adminAuthController.changePassword);

// ============================================
// Dashboard Routes (Phase 2)
// ============================================

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard overview statistics
 * @access  Protected (Admin)
 */
router.get('/dashboard/stats', dashboardController.getStats);

/**
 * @route   GET /api/admin/dashboard/growth
 * @desc    Get user growth data for charts
 * @access  Protected (Admin)
 * @query   ?months=12
 */
router.get('/dashboard/growth', dashboardController.getUserGrowth);

/**
 * @route   GET /api/admin/dashboard/engagement
 * @desc    Get engagement metrics
 * @access  Protected (Admin)
 */
router.get('/dashboard/engagement', dashboardController.getEngagementMetrics);

/**
 * @route   GET /api/admin/dashboard/streaks
 * @desc    Get streak distribution statistics
 * @access  Protected (Admin)
 */
router.get('/dashboard/streaks', dashboardController.getStreakStats);

/**
 * @route   GET /api/admin/dashboard/top-users
 * @desc    Get top active users
 * @access  Protected (Admin)
 * @query   ?limit=10
 */
router.get('/dashboard/top-users', dashboardController.getTopUsers);

// ============================================
// User Management Routes (Phase 3)
// ============================================

/**
 * @route   GET /api/admin/users
 * @desc    Get users with filters and pagination
 * @access  Protected (Admin)
 * @query   ?page=1&limit=20&search=&status=active&sortBy=created_at&sortOrder=DESC
 */
router.get('/users', userManagementController.getUsers);

/**
 * @route   GET /api/admin/users/search
 * @desc    Search users by username, phone, email
 * @access  Protected (Admin)
 * @query   ?q=query
 */
router.get('/users/search', userManagementController.searchUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details by ID
 * @access  Protected (Admin)
 */
router.get('/users/:id', userManagementController.getUserDetails);

/**
 * @route   PATCH /api/admin/users/:id/freeze
 * @desc    Freeze user account
 * @access  Protected (Admin)
 * @body    { reason: string }
 */
router.patch('/users/:id/freeze', userManagementController.freezeUser);

/**
 * @route   PATCH /api/admin/users/:id/unfreeze
 * @desc    Unfreeze user account
 * @access  Protected (Admin)
 */
router.patch('/users/:id/unfreeze', userManagementController.unfreezeUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account (soft delete, superadmin only)
 * @access  Protected (Superadmin)
 * @body    { reason: string } (optional)
 */
router.delete('/users/:id', userManagementController.deleteUser);

// ============================================
// Placeholder routes for Phase 4-5
// ============================================

// Post management routes (Phase 4)
router.get('/posts', postManagementController.getPosts);
router.get('/posts/:id', postManagementController.getPostDetails);
router.delete('/posts/:id', postManagementController.deletePost);
router.delete('/comments/:id', postManagementController.deleteComment);

// Report management routes (Phase 4)
router.get('/reports', reportController.getReports);
router.get('/reports/:id', reportController.getReportDetails);
router.patch('/reports/:id/review', reportController.reviewReport);
router.patch('/reports/:id/resolve', reportController.resolveReport);
router.patch('/reports/:id/dismiss', reportController.dismissReport);

// ============================================
// FAQ Management Routes (Phase 5)
// ============================================

/**
 * @route   GET /api/admin/faqs/categories
 * @desc    Get FAQ categories
 * @access  Protected (Admin)
 */
router.get('/faqs/categories', faqController.getFAQCategories);

/**
 * @route   GET /api/admin/faqs
 * @desc    Get all FAQs with filtering
 * @access  Protected (Admin)
 * @query   ?page=1&limit=20&category=all&active=true&search=&sortBy=display_order&sortOrder=ASC
 */
router.get('/faqs', faqController.getFAQs);

/**
 * @route   GET /api/admin/faqs/:id
 * @desc    Get single FAQ by ID
 * @access  Protected (Admin)
 */
router.get('/faqs/:id', faqController.getFAQById);

/**
 * @route   POST /api/admin/faqs
 * @desc    Create new FAQ
 * @access  Protected (Admin)
 * @body    { question, answer, category, display_order, is_active }
 */
router.post('/faqs', faqController.createFAQ);

/**
 * @route   PATCH /api/admin/faqs/:id
 * @desc    Update FAQ
 * @access  Protected (Admin)
 * @body    { question, answer, category, is_active, display_order }
 */
router.patch('/faqs/:id', faqController.updateFAQ);

/**
 * @route   DELETE /api/admin/faqs/:id
 * @desc    Delete FAQ
 * @access  Protected (Admin)
 */
router.delete('/faqs/:id', faqController.deleteFAQ);

/**
 * @route   PATCH /api/admin/faqs/:id/toggle
 * @desc    Toggle FAQ active status
 * @access  Protected (Admin)
 * @body    { is_active }
 */
router.patch('/faqs/:id/toggle', faqController.toggleFAQStatus);

/**
 * @route   PATCH /api/admin/faqs/reorder
 * @desc    Reorder FAQs
 * @access  Protected (Admin)
 * @body    { orders: [{ id, display_order }, ...] }
 */
router.patch('/faqs/reorder', faqController.reorderFAQs);

module.exports = router;
