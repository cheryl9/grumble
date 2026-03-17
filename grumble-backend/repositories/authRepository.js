const pool = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * User Repository
 * Handles database operations for users and password reset OTPs
 */

/**
 * Find user by ID
 */
const findUserById = async (userId) => {
  const result = await pool.query(
    'SELECT id, phone_number, username, account_status, is_deleted, frozen_at, frozen_reason, telegram_chat_id, telegram_username, telegram_first_name, telegram_connected_at, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

/**
 * Find user by phone number
 */
const findUserByPhoneNumber = async (phoneNumber) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE phone_number = $1',
    [phoneNumber]
  );
  return result.rows[0];
};

/**
 * Find user by username
 */
const findUserByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

/**
 * Create a new user
 */
const createUser = async (phoneNumber, username, password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    `INSERT INTO users (phone_number, username, password_hash) 
     VALUES ($1, $2, $3) 
     RETURNING id, phone_number, username, created_at`,
    [phoneNumber, username, passwordHash]
  );
  
  return result.rows[0];
};

/**
 * Update user password
 */
const updatePassword = async (phoneNumber, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  const result = await pool.query(
    `UPDATE users 
     SET password_hash = $1, updated_at = NOW() 
     WHERE phone_number = $2 
     RETURNING id, phone_number, username`,
    [passwordHash, phoneNumber]
  );
  
  return result.rows[0];
};

/**
 * Verify user password
 */
const verifyPassword = async (username, password) => {
  const user = await findUserByUsername(username);
  
  if (!user) {
    return null;
  }
  
  // Check if account is deleted
  if (user.is_deleted) {
    return { error: 'deleted', message: 'This account has been deleted' };
  }
  
  // Check if account is frozen
  if (user.account_status === 'frozen') {
    return { 
      error: 'frozen', 
      message: 'This account has been frozen', 
      reason: user.frozen_reason,
      frozenAt: user.frozen_at 
    };
  }
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Save OTP for password reset
 */
const savePasswordResetOTP = async (phoneNumber, otpCode, expiresInMinutes = 10) => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  const result = await pool.query(
    `INSERT INTO password_reset_otps (phone_number, otp_code, expires_at) 
     VALUES ($1, $2, $3) 
     RETURNING id, phone_number, expires_at`,
    [phoneNumber, otpCode, expiresAt]
  );
  
  return result.rows[0];
};

/**
 * Verify OTP for password reset
 */
const verifyPasswordResetOTP = async (phoneNumber, otpCode) => {
  const result = await pool.query(
    `SELECT * FROM password_reset_otps 
     WHERE phone_number = $1 
       AND otp_code = $2 
       AND is_used = FALSE 
       AND expires_at > NOW() 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [phoneNumber, otpCode]
  );
  
  return result.rows[0];
};

/**
 * Mark OTP as used
 */
const markOTPAsUsed = async (otpId) => {
  await pool.query(
    'UPDATE password_reset_otps SET is_used = TRUE WHERE id = $1',
    [otpId]
  );
};

/**
 * Clean up expired OTPs (optional cleanup job)
 */
const cleanupExpiredOTPs = async () => {
  const result = await pool.query(
    'DELETE FROM password_reset_otps WHERE expires_at < NOW()',
  );
  
  return result.rowCount;
};

/**
 * Update user's Telegram connection info
 */
const updateTelegramConnection = async (userId, telegramData) => {
  const { chatId, username, firstName } = telegramData;
  
  const result = await pool.query(
    `UPDATE users 
     SET telegram_chat_id = $1,
         telegram_username = $2,
         telegram_first_name = $3,
         telegram_connected_at = NOW()
     WHERE id = $4
     RETURNING id, username, telegram_chat_id, telegram_username, telegram_connected_at`,
    [chatId, username, firstName, userId]
  );
  
  return result.rows[0];
};

/**
 * Disconnect user's Telegram account
 */
const disconnectTelegram = async (userId) => {
  const result = await pool.query(
    `UPDATE users 
     SET telegram_chat_id = NULL,
         telegram_username = NULL,
         telegram_first_name = NULL,
         telegram_connected_at = NULL
     WHERE id = $1
     RETURNING id, username`,
    [userId]
  );
  
  return result.rows[0];
};

/**
 * Find user by Telegram chat ID
 */
const findUserByTelegramChatId = async (chatId) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE telegram_chat_id = $1',
    [chatId]
  );
  return result.rows[0];
};

module.exports = {
  findUserById,
  findUserByPhoneNumber,
  findUserByUsername,
  createUser,
  updatePassword,
  verifyPassword,
  savePasswordResetOTP,
  verifyPasswordResetOTP,
  markOTPAsUsed,
  cleanupExpiredOTPs,
  updateTelegramConnection,
  disconnectTelegram,
  findUserByTelegramChatId
};
