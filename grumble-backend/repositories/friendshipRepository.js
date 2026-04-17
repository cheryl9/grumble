const pool = require("../config/db");

/**
 * Friendship Repository
 * Minimal helpers for accepted friendships.
 */

const areFriends = async (userId, otherUserId) => {
  const result = await pool.query(
    `SELECT 1
     FROM friendships
     WHERE status = 'accepted'
       AND ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
     LIMIT 1`,
    [userId, otherUserId],
  );

  return result.rows.length > 0;
};

const getAcceptedFriends = async (userId) => {
  const result = await pool.query(
    `SELECT
        CASE
          WHEN f.user_id = $1 THEN f.friend_id
          ELSE f.user_id
        END AS friend_id
     FROM friendships f
     WHERE f.status = 'accepted'
       AND (f.user_id = $1 OR f.friend_id = $1)`,
    [userId],
  );

  return result.rows;
};

const getAcceptedFriendsWithProfiles = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar_url
     FROM friendships f
     JOIN users u
       ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
     WHERE f.status = 'accepted'
       AND (f.user_id = $1 OR f.friend_id = $1)
     ORDER BY u.username ASC`,
    [userId],
  );

  return result.rows;
};

const searchAcceptedFriends = async (userId, query) => {
  const q = `%${query}%`;
  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar_url
     FROM friendships f
     JOIN users u
       ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
     WHERE f.status = 'accepted'
       AND (f.user_id = $1 OR f.friend_id = $1)
       AND u.username ILIKE $2
     ORDER BY u.username ASC
     LIMIT 50`,
    [userId, q],
  );

  return result.rows;
};

module.exports = {
  areFriends,
  getAcceptedFriends,
  getAcceptedFriendsWithProfiles,
  searchAcceptedFriends,
};
