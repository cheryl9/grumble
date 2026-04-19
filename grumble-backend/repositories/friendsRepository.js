const pool = require("../config/db");
const { executeTransaction } = require("../utils/transactionHelper");

/**
 * Send a friend request from userId to friendId.
 * If friendId already sent a request to userId, auto-accept (mutual request).
 * Returns { friendship, autoAccepted } object.
 *
 * Uses SERIALIZABLE transaction with FOR UPDATE locking to prevent race conditions.
 */
async function sendFriendRequest(userId, friendId) {
  return executeTransaction(async (client) => {
    // Check if a reverse pending request exists (friendId -> userId) with FOR UPDATE lock
    const reverse = await client.query(
      `SELECT id, status FROM friendships
       WHERE user_id = $1 AND friend_id = $2
       FOR UPDATE`,
      [friendId, userId],
    );

    if (reverse.rows.length > 0) {
      const row = reverse.rows[0];
      if (row.status === "accepted") {
        return { friendship: row, autoAccepted: false, alreadyFriends: true };
      }
      if (row.status === "pending") {
        // Auto-accept: the other person already wants to be friends
        const updated = await client.query(
          `UPDATE friendships SET status = 'accepted', updated_at = NOW()
           WHERE id = $1 RETURNING *`,
          [row.id],
        );
        return { friendship: updated.rows[0], autoAccepted: true };
      }
    }

    // Check if a forward request already exists (userId -> friendId) with FOR UPDATE lock
    const existing = await client.query(
      `SELECT id, status FROM friendships
       WHERE user_id = $1 AND friend_id = $2
       FOR UPDATE`,
      [userId, friendId],
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.status === "accepted") {
        return { friendship: row, autoAccepted: false, alreadyFriends: true };
      }
      if (row.status === "pending") {
        return { friendship: row, autoAccepted: false, alreadyPending: true };
      }
      // If declined, allow re-sending by updating status back to pending
      if (row.status === "declined") {
        const updated = await client.query(
          `UPDATE friendships SET status = 'pending', updated_at = NOW()
           WHERE id = $1 RETURNING *`,
          [row.id],
        );
        return { friendship: updated.rows[0], autoAccepted: false };
      }
    }

    // No existing row — insert a new pending request
    const result = await client.query(
      `INSERT INTO friendships (user_id, friend_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [userId, friendId],
    );
    return { friendship: result.rows[0], autoAccepted: false };
  });
}

/**
 * Accept a pending friend request.
 * Only the receiver (friend_id) can accept.
 */
async function acceptFriendRequest(requestId, userId) {
  const result = await pool.query(
    `UPDATE friendships
     SET status = 'accepted', updated_at = NOW()
     WHERE id = $1 AND friend_id = $2 AND status = 'pending'
     RETURNING *`,
    [requestId, userId],
  );
  return result.rows[0] || null;
}

/**
 * Decline a pending friend request.
 * Only the receiver (friend_id) can decline. Deletes the row.
 */
async function declineFriendRequest(requestId, userId) {
  const result = await pool.query(
    `DELETE FROM friendships
     WHERE id = $1 AND friend_id = $2 AND status = 'pending'
     RETURNING *`,
    [requestId, userId],
  );
  return result.rows[0] || null;
}

/**
 * Remove an accepted friend. Either party can remove.
 */
async function removeFriend(friendshipId, userId) {
  const result = await pool.query(
    `DELETE FROM friendships
     WHERE id = $1
       AND (user_id = $2 OR friend_id = $2)
       AND status = 'accepted'
     RETURNING *`,
    [friendshipId, userId],
  );
  return result.rows[0] || null;
}

/**
 * Get all accepted friends for a user.
 * Joins with users table to get friend's username and avatar.
 * Handles both directions (user could be user_id or friend_id).
 */
async function getFriends(userId) {
  const result = await pool.query(
    `SELECT
       f.id AS friendship_id,
       f.updated_at AS created_at,
       CASE
         WHEN f.user_id = $1 THEN u_friend.id
         ELSE u_user.id
       END AS friend_user_id,
       CASE
         WHEN f.user_id = $1 THEN u_friend.username
         ELSE u_user.username
       END AS friend_username,
       CASE
         WHEN f.user_id = $1 THEN u_friend.avatar_url
         ELSE u_user.avatar_url
       END AS friend_avatar_url
       ,CASE
         WHEN f.user_id = $1 THEN u_friend.equipped_avatar
         ELSE u_user.equipped_avatar
       END AS friend_equipped_avatar
     FROM friendships f
     JOIN users u_user   ON u_user.id   = f.user_id
     JOIN users u_friend ON u_friend.id = f.friend_id
     WHERE (f.user_id = $1 OR f.friend_id = $1)
       AND f.status = 'accepted'
     ORDER BY f.updated_at DESC`,
    [userId],
  );
  return result.rows;
}

/**
 * Check if two users have an accepted friendship.
 */
async function areFriends(userId, otherUserId) {
  const result = await pool.query(
    `SELECT 1
     FROM friendships
     WHERE status = 'accepted'
       AND ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
     LIMIT 1`,
    [userId, otherUserId],
  );

  return result.rows.length > 0;
}

/**
 * Get pending incoming friend requests for a user.
 * These are rows where friend_id = userId and status = 'pending'.
 */
async function getPendingRequests(userId) {
  const result = await pool.query(
    `SELECT
       f.id AS friendship_id,
       f.user_id AS requester_id,
       u.username AS requester_username,
       u.equipped_avatar,
       f.created_at
     FROM friendships f
     JOIN users u ON u.id = f.user_id
     WHERE f.friend_id = $1
       AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return result.rows;
}

/**
 * Get sent (outgoing) pending requests by the current user.
 */
async function getSentRequests(userId) {
  const result = await pool.query(
    `SELECT
       f.id AS friendship_id,
       f.friend_id AS recipient_id,
       u.username AS recipient_username,
       u.equipped_avatar,
       f.created_at
     FROM friendships f
     JOIN users u ON u.id = f.friend_id
     WHERE f.user_id = $1
       AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return result.rows;
}

/**
 * Search users by username substring. Excludes the current user.
 */
async function searchUsers(query, currentUserId) {
  const result = await pool.query(
    `SELECT id, username, equipped_avatar
     FROM users
     WHERE username ILIKE $1
       AND id != $2
       AND (is_deleted IS NULL OR is_deleted = false)
     ORDER BY username ASC
     LIMIT 20`,
    [`%${query}%`, currentUserId],
  );
  return result.rows;
}

/**
 * Get a flat array of friend user IDs for a given user.
 * Used by postsRepository for the friends-tab feed query.
 */
async function getFriendIds(userId) {
  const result = await pool.query(
    `SELECT
       CASE
         WHEN user_id = $1 THEN friend_id
         ELSE user_id
       END AS friend_id
     FROM friendships
     WHERE (user_id = $1 OR friend_id = $1)
       AND status = 'accepted'`,
    [userId],
  );
  return result.rows.map((r) => r.friend_id);
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getSentRequests,
  searchUsers,
  getFriendIds,
  areFriends,
};
