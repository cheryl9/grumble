const { get } = require('../app');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// user lookups 

const findUserById = async (userId) => {
  const result = await pool.query(
    `SELECT id, phone_number, username, account_status, is_deleted,
            frozen_at, frozen_reason, telegram_chat_id, telegram_username,
            telegram_first_name, telegram_connected_at, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
};

const findUserByPhoneNumber = async (phoneNumber) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE phone_number = $1',
    [phoneNumber]
  );
  return result.rows[0];
};

const findUserByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

// auth

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

const verifyPassword = async (username, password) => {
  const user = await findUserByUsername(username);
  if (!user) return null;

  if (user.is_deleted) {
    return { error: 'deleted', message: 'This account has been deleted' };
  }
  if (user.account_status === 'frozen') {
    return {
      error: 'frozen',
      message: 'This account has been frozen',
      reason: user.frozen_reason,
      frozenAt: user.frozen_at,
    };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;

  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// password reset (OTP)

const updatePassword = async (phoneNumber, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const result = await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW()
     WHERE phone_number = $2
     RETURNING id, phone_number, username`,
    [passwordHash, phoneNumber]
  );
  return result.rows[0];
};

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

const markOTPAsUsed = async (otpId) => {
  await pool.query(
    'UPDATE password_reset_otps SET is_used = TRUE WHERE id = $1',
    [otpId]
  );
};

const cleanupExpiredOTPs = async () => {
  const result = await pool.query(
    'DELETE FROM password_reset_otps WHERE expires_at < NOW()'
  );
  return result.rowCount;
};

// profile updates

const isUsernameTaken = async (username, excludeUserId) => {
  const result = await pool.query(
    'SELECT id FROM users WHERE username = $1 AND id != $2',
    [username, excludeUserId]
  );
  return result.rows.length > 0;
};

const updateUser = async (userId, { username, phone_number }) => {
  const result = await pool.query(
    `UPDATE users SET username = $1, phone_number = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, username, phone_number`,
    [username, phone_number, userId]
  );
  return result.rows[0];
};

// Used by change-password flow (authenticated user, knows current password)
const updatePasswordById = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [passwordHash, userId]
  );
};

// Fetch password_hash for current-password verification
const getPasswordHashById = async (userId) => {
  const result = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.password_hash;
};

// stats 

const getUserStats = async (userId) => {
  const [postsResult, likedResult, savedResult] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM posts WHERE user_id = $1 AND is_deleted = FALSE', [userId]),
    pool.query('SELECT COUNT(*) FROM likes WHERE user_id = $1', [userId]),
    pool.query('SELECT COUNT(*) FROM saves WHERE user_id = $1', [userId]),
  ]);

  const streak = await getStreakByUserId(userId);

  return {
    posts: parseInt(postsResult.rows[0].count),
    liked: parseInt(likedResult.rows[0].count),
    saved: parseInt(savedResult.rows[0].count),
    currentStreak:  streak?.current_streak  || 0,
    longestStreak:  streak?.longest_streak  || 0,
    lastPostDate:   streak?.last_post_date  || null,
  };
};

// preferences

const savePreferences = async (userId, cuisines) => {
  const result = await pool.query(
    `INSERT INTO user_preferences (user_id, cuisines)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET cuisines = $2
     RETURNING *`,
    [userId, JSON.stringify(cuisines)]
  );
  return result.rows[0];
};

// telegram integration

const updateTelegramConnection = async (userId, telegramData) => {
  const { chatId, username, firstName } = telegramData;
  const result = await pool.query(
    `UPDATE users
     SET telegram_chat_id = $1, telegram_username = $2,
         telegram_first_name = $3, telegram_connected_at = NOW()
     WHERE id = $4
     RETURNING id, username, telegram_chat_id, telegram_username, telegram_connected_at`,
    [chatId, username, firstName, userId]
  );
  return result.rows[0];
};

const disconnectTelegram = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET telegram_chat_id = NULL, telegram_username = NULL,
         telegram_first_name = NULL, telegram_connected_at = NULL
     WHERE id = $1
     RETURNING id, username`,
    [userId]
  );
  return result.rows[0];
};

const findUserByTelegramChatId = async (chatId) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE telegram_chat_id = $1',
    [chatId]
  );
  return result.rows[0];
};

// streaks

const getStreakByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM user_streaks WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

const upsertStreak = async (userId, currentStreak, longestStreak, lastPostDate) => {
  const result = await pool.query(
    `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_post_date, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id) DO UPDATE
       SET current_streak = $2,
           longest_streak = $3,
           last_post_date = $4,
           updated_at     = NOW()
     RETURNING *`,
    [userId, currentStreak, longestStreak, lastPostDate]
  );
  return result.rows[0];
};

const calculateAndUpdateStreak = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr     = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const streak = await getStreakByUserId(userId);

  // No streak row yet — this is their first post
  if (!streak) {
    return await upsertStreak(userId, 1, 1, todayStr);
  }

  const lastPost = streak.last_post_date
    ? new Date(streak.last_post_date).toISOString().split('T')[0]
    : null;

  // Already posted today — do nothing, return current streak as-is
  if (lastPost === todayStr) {
    return streak;
  }

  let newCurrent;

  if (lastPost === yesterdayStr) {
    // Consecutive day — increment
    newCurrent = streak.current_streak + 1;
  } else {
    // Gap of 2+ days — reset
    newCurrent = 1;
  }

  const newLongest = Math.max(newCurrent, streak.longest_streak);
  return await upsertStreak(userId, newCurrent, newLongest, todayStr);
};

module.exports = {
  findUserById,
  findUserByPhoneNumber,
  findUserByUsername,
  findUserByTelegramChatId,
  createUser,
  verifyPassword,
  updatePassword,
  savePasswordResetOTP,
  verifyPasswordResetOTP,
  markOTPAsUsed,
  cleanupExpiredOTPs,
  isUsernameTaken,
  updateUser,
  updatePasswordById,
  getPasswordHashById,
  getUserStats,
  savePreferences,
  updateTelegramConnection,
  disconnectTelegram,
  getStreakByUserId,
  calculateAndUpdateStreak,
};