const authRepository = require("../repositories/authRepository");
const bcrypt = require("bcrypt");
const telegramService = require("../services/telegramService");
const jwt = require("jsonwebtoken");
const { get } = require("../app");
const {
  checkAndUnlockAchievements,
  syncAchievements,
  getUserAchievements,
  equipAvatar,
} = require("../services/achievementService");

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { phoneNumber, username, password } = req.body;

    if (!phoneNumber || !username || !password) {
      const missing = [];
      if (!phoneNumber) missing.push("phone number");
      if (!username) missing.push("username");
      if (!password) missing.push("password");
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        field: missing[0],
      });
    }

    const existingPhone =
      await authRepository.findUserByPhoneNumber(phoneNumber);
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message:
          "This phone number is already registered. Please use a different phone number or log in.",
        field: "phoneNumber",
      });
    }

    const existingUsername = await authRepository.findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message:
          "This username is already taken. Please choose a different username.",
        field: "username",
      });
    }

    const user = await authRepository.createUser(
      phoneNumber,
      username,
      password,
    );

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "grumble-secret-key",
      { expiresIn: "30d" },
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          username: user.username,
          created_at: user.created_at,
        },
        token,
      },
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

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await authRepository.verifyPassword(username, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (user.error === "frozen") {
      return res.status(403).json({
        success: false,
        message: user.message,
        reason: user.reason,
        frozenAt: user.frozenAt,
      });
    }

    if (user.error === "deleted") {
      return res.status(403).json({
        success: false,
        message: user.message,
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "grumble-secret-key",
      { expiresIn: "30d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          username: user.username,
          created_at: user.created_at,
          telegramChatId: user.telegram_chat_id,
          telegramUsername: user.telegram_username,
          telegramFirstName: user.telegram_first_name,
          telegramConnectedAt: user.telegram_connected_at,
        },
        token,
      },
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
    const user = await authRepository.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          username: user.username,
          created_at: user.created_at,
          telegramChatId: user.telegram_chat_id,
          telegramUsername: user.telegram_username,
          telegramFirstName: user.telegram_first_name,
          telegramConnectedAt: user.telegram_connected_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    res.json({ success: true, message: "Logout successful" });
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

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const user = await authRepository.findUserByPhoneNumber(phoneNumber);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number",
      });
    }

    if (!user.telegram_chat_id) {
      return res.status(400).json({
        success: false,
        message: "Please connect your Telegram account first to receive OTP",
        requiresTelegram: true,
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await authRepository.savePasswordResetOTP(phoneNumber, otpCode, 10);

    try {
      await telegramService.sendOTP(user.telegram_chat_id, otpCode);
      res.json({
        success: true,
        message: "OTP sent to your Telegram",
        data: { expiresIn: 600, method: "telegram" },
      });
    } catch (telegramError) {
      console.error("Failed to send via Telegram, logging to console");
      telegramService.logToConsole(user.telegram_chat_id, otpCode);
      res.json({
        success: true,
        message: "OTP generated (check server console in dev mode)",
        data: { expiresIn: 600, method: "console", devOTP: otpCode },
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

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const otpRecord = await authRepository.verifyPasswordResetOTP(
      phoneNumber,
      otp,
    );

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.json({ success: true, message: "OTP verified successfully" });
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

    if (!phoneNumber || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Phone number, OTP, and new password are required",
      });
    }

    const otpRecord = await authRepository.verifyPasswordResetOTP(
      phoneNumber,
      otp,
    );

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = await authRepository.updatePassword(phoneNumber, newPassword);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await authRepository.markOTPAsUsed(otpRecord.id);

    res.json({
      success: true,
      message: "Password reset successfully",
      data: { username: user.username },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connect Telegram
 */
const connectTelegram = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Please login first." });
    }
    if (!chatId) {
      return res
        .status(400)
        .json({ success: false, message: "Telegram Chat ID is required" });
    }
    if (!/^\d+$/.test(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Chat ID format" });
    }

    const existingUser = await authRepository.findUserByTelegramChatId(chatId);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({
        success: false,
        message: "This Telegram account is already connected to another user",
      });
    }

    let telegramUsername = null;
    let telegramFirstName = null;

    try {
      const chatInfo = await telegramService.getChatInfo(chatId);
      telegramUsername = chatInfo.username ? `@${chatInfo.username}` : null;
      telegramFirstName = chatInfo.first_name;
    } catch (error) {
      console.warn("Could not fetch Telegram user info:", error.message);
    }

    const updatedUser = await authRepository.updateTelegramConnection(userId, {
      chatId,
      username: telegramUsername,
      firstName: telegramFirstName,
    });

    res.json({
      success: true,
      message: "Telegram connected successfully",
      data: {
        telegram_chat_id: updatedUser.telegram_chat_id,
        telegram_username: updatedUser.telegram_username,
        telegram_connected_at: updatedUser.telegram_connected_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect Telegram
 */
const disconnectTelegram = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Please login first." });
    }

    await authRepository.disconnectTelegram(userId);
    res.json({ success: true, message: "Telegram disconnected successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user stats (posts, liked, saved counts)
 */
const getUserStats = async (req, res, next) => {
  try {
    const stats = await authRepository.getUserStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile (username + phone number)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { username, phone_number } = req.body;

    if (!username || !phone_number) {
      const missing = [];
      if (!username) missing.push("username");
      if (!phone_number) missing.push("phone number");
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        field: missing[0],
      });
    }

    const usernameTaken = await authRepository.isUsernameTaken(
      username,
      req.user.id,
    );
    if (usernameTaken) {
      return res.status(409).json({
        success: false,
        message:
          "This username is already taken. Please choose a different username.",
        field: "username",
      });
    }

    const phoneTaken = await authRepository.isPhoneNumberTaken(
      phone_number,
      req.user.id,
    );
    if (phoneTaken) {
      return res.status(409).json({
        success: false,
        message:
          "This phone number is already in use by another account. Please use a different phone number.",
        field: "phone_number",
      });
    }

    const updated = await authRepository.updateUser(req.user.id, {
      username,
      phone_number,
    });
    res.json({
      success: true,
      message: "Profile updated",
      data: {
        user: {
          id: updated.id,
          phoneNumber: updated.phone_number,
          username: updated.username,
          created_at: updated.created_at,
          updated_at: updated.updated_at,
          telegramChatId: updated.telegram_chat_id,
          telegramUsername: updated.telegram_username,
          telegramFirstName: updated.telegram_first_name,
          telegramConnectedAt: updated.telegram_connected_at,
          avatar_url: updated.avatar_url,
          equipped_avatar: updated.equipped_avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (authenticated user)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      const missing = [];
      if (!currentPassword) missing.push("current password");
      if (!newPassword) missing.push("new password");
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        field: missing[0],
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
        field: "newPassword",
      });
    }

    const hash = await authRepository.getPasswordHashById(req.user.id);
    const match = await bcrypt.compare(currentPassword, hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect. Please try again.",
        field: "currentPassword",
      });
    }

    await authRepository.updatePasswordById(req.user.id, newPassword);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Save onboarding cuisine preferences
 */
const savePreferences = async (req, res, next) => {
  try {
    const { cuisines } = req.body;

    if (!Array.isArray(cuisines)) {
      return res
        .status(400)
        .json({ success: false, message: "Cuisines must be an array" });
    }

    const prefs = await authRepository.savePreferences(req.user.id, cuisines);
    res.json({
      success: true,
      message: "Preferences saved",
      data: { preferences: prefs },
    });
  } catch (error) {
    next(error);
  }
};

// streaks
const getStreak = async (req, res, next) => {
  try {
    const streak = await authRepository.getStreakByUserId(req.user.id);
    res.json({
      success: true,
      data: {
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// achievements
async function getAchievements(req, res) {
  try {
    const { newlyUnlocked } = await syncAchievements(
      req.user.id,
      req.db,
    );
    const data = await getUserAchievements(req.user.id, req.db);
    res.json({ success: true, data: { ...data, newlyUnlockedKeys: newlyUnlocked } });
  } catch (err) {
    console.error("getAchievements error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch achievements" });
  }
}

async function equipAvatarController(req, res) {
  try {
    const { achievementKey } = req.body;
    const data = await equipAvatar(req.user.id, achievementKey ?? null, req.db);
    res.json({ success: true, data });
  } catch (err) {
    if (err.message === "Achievement not unlocked") {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error("equipAvatar error:", err);
    res.status(500).json({ success: false, message: "Failed to equip avatar" });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  connectTelegram,
  disconnectTelegram,
  getUserStats,
  updateProfile,
  changePassword,
  savePreferences,
  getStreak,
  getAchievements,
  equipAvatarController,
};
