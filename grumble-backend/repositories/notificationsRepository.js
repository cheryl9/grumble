const pool = require("../config/db");

async function createNotification(userId, { type, title, body, payload = {} }) {
  const result = await pool.query(
    `INSERT INTO user_notifications (user_id, type, title, body, payload)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, body, JSON.stringify(payload)],
  );

  return result.rows[0];
}

async function getUnreadNotifications(userId, limit = 10) {
  const result = await pool.query(
    `SELECT id, type, title, body, payload, created_at
     FROM user_notifications
     WHERE user_id = $1
       AND is_read = FALSE
     ORDER BY created_at ASC
     LIMIT $2`,
    [userId, limit],
  );

  return result.rows;
}

async function markNotificationsRead(notificationIds, userId) {
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return 0;
  }

  const result = await pool.query(
    `UPDATE user_notifications
     SET is_read = TRUE,
         read_at = NOW()
     WHERE user_id = $1
       AND id = ANY($2::int[])`,
    [userId, notificationIds],
  );

  return result.rowCount;
}

module.exports = {
  createNotification,
  getUnreadNotifications,
  markNotificationsRead,
};