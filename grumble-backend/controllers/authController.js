const authRepository = require('../repositories/authRepository');
const telegramService = require('../services/telegramService');
const jwt = require('jsonwebtoken');

/**
 * Auth Controller
 * Handles authentication logic
 */

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { phoneNumber, username, password } = req.body;
    
    // Validate input
    if (!phoneNumber || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, username, and password are required'
      });
    }
    
    // Check if phone number already exists
    const existingPhone = await authRepository.findUserByPhoneNumber(phoneNumber);
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered'
      });
    }
    
    // Check if username already exists
    const existingUsername = await authRepository.findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }
    
    // Create user
    const user = await authRepository.createUser(phoneNumber, username, password);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'grumble-secret-key',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Verify credentials
    const user = await authRepository.verifyPassword(username, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Check if account is frozen
    if (user.error === 'frozen') {
      return res.status(403).json({
        success: false,
        message: user.message,
        reason: user.reason,
        frozenAt: user.frozenAt
      });
    }
    
    // Check if account is deleted
    if (user.error === 'deleted') {
      return res.status(403).json({
        success: false,
        message: user.message
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'grumble-secret-key',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          username: user.username,
          telegramChatId: user.telegram_chat_id,
          telegramUsername: user.telegram_username,
          telegramFirstName: user.telegram_first_name,
          telegramConnectedAt: user.telegram_connected_at
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id; // From JWT middleware
    
    const user = await authRepository.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          username: user.username,
          telegramChatId: user.telegram_chat_id,
          telegramUsername: user.telegram_username,
          telegramFirstName: user.telegram_first_name,
          telegramConnectedAt: user.telegram_connected_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side handles token removal)
 */
const logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send OTP for password reset
 */
const sendPasswordResetOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    
    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Check if user exists with this phone number
    const user = await authRepository.findUserByPhoneNumber(phoneNumber);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number'
      });
    }
    
    // Check if user has connected Telegram
    if (!user.telegram_chat_id) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your Telegram account first to receive OTP',
        requiresTelegram: true
      });
    }
    
    // Generate OTP (6-digit random number)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to database
    await authRepository.savePasswordResetOTP(phoneNumber, otpCode, 10);
    
    // Send OTP via Telegram
    try {
      await telegramService.sendOTP(user.telegram_chat_id, otpCode);
      
      res.json({
        success: true,
        message: 'OTP sent to your Telegram',
        data: {
          expiresIn: 600, // 10 minutes in seconds
          method: 'telegram'
        }
      });
    } catch (telegramError) {
      // If Telegram send fails, log to console for development
      console.error('Failed to send via Telegram, logging to console');
      telegramService.logToConsole(user.telegram_chat_id, otpCode);
      
      res.json({
        success: true,
        message: 'OTP generated (check server console in dev mode)',
        data: {
          expiresIn: 600,
          method: 'console',
          devOTP: otpCode // Include in dev mode
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP for password reset
 */
const verifyPasswordResetOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }
    
    // Verify OTP
    const otpRecord = await authRepository.verifyPasswordResetOTP(phoneNumber, otp);
    
    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with verified OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const { phoneNumber, otp, newPassword } = req.body;
    
    // Validate input
    if (!phoneNumber || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and new password are required'
      });
    }
    
    // Verify OTP again
    const otpRecord = await authRepository.verifyPasswordResetOTP(phoneNumber, otp);
    
    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Update password
    const user = await authRepository.updatePassword(phoneNumber, newPassword);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mark OTP as used
    await authRepository.markOTPAsUsed(otpRecord.id);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        username: user.username
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connect user's Telegram account
 */
const connectTelegram = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Assuming you have auth middleware
    const { chatId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.'
      });
    }

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Telegram Chat ID is required'
      });
    }

    // Validate chat ID format (should be numeric)
    if (!/^\d+$/.test(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Chat ID format'
      });
    }

    // Check if this chat_id is already connected to another user
    const existingUser = await authRepository.findUserByTelegramChatId(chatId);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({
        success: false,
        message: 'This Telegram account is already connected to another user'
      });
    }

    // Try to get user info from Telegram (optional - requires bot API call)
    let telegramUsername = null;
    let telegramFirstName = null;

    try {
      const chatInfo = await telegramService.getChatInfo(chatId);
      telegramUsername = chatInfo.username ? `@${chatInfo.username}` : null;
      telegramFirstName = chatInfo.first_name;
    } catch (error) {
      console.warn('Could not fetch Telegram user info:', error.message);
      // Continue anyway - username/first_name are optional
    }

    // Update user with Telegram connection
    const updatedUser = await authRepository.updateTelegramConnection(userId, {
      chatId,
      username: telegramUsername,
      firstName: telegramFirstName
    });

    res.json({
      success: true,
      message: 'Telegram connected successfully',
      data: {
        telegram_chat_id: updatedUser.telegram_chat_id,
        telegram_username: updatedUser.telegram_username,
        telegram_connected_at: updatedUser.telegram_connected_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect user's Telegram account
 */
const disconnectTelegram = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.'
      });
    }

    await authRepository.disconnectTelegram(userId);

    res.json({
      success: true,
      message: 'Telegram disconnected successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  connectTelegram,
  disconnectTelegram
};
