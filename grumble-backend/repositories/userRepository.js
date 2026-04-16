const pool = require('../config/db');

/**
 * User Repository
 * Minimal profile access for chat/group features.
 */

const getUserProfileById = async (userId) => {
  const result = await pool.query(
    `SELECT id, username, avatar_url
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
};

module.exports = {
  getUserProfileById
};
