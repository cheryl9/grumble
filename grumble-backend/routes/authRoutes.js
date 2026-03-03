const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Auth Routes
 */

// User registration
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

// Get current user profile (requires authentication)
router.get('/user', authMiddleware, authController.getCurrentUser);

// User logout
router.post('/logout', authController.logout);

// Password reset - Send OTP
router.post('/forgot-password/send-otp', authController.sendPasswordResetOTP);

// Password reset - Verify OTP
router.post('/forgot-password/verify-otp', authController.verifyPasswordResetOTP);

// Password reset - Reset password
router.post('/forgot-password/reset', authController.resetPassword);

// Telegram integration (requires authentication)
router.post('/telegram/connect', authMiddleware, authController.connectTelegram);
router.post('/telegram/disconnect', authMiddleware, authController.disconnectTelegram);

module.exports = router;
