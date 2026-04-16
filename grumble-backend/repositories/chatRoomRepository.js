const { get } = require("../app");
const pool = require("../config/db");

/**
 * Chat Room Repository
 * Handles database operations for chat rooms and their members
 */

/**
 * Create a new chat room (direct or group)
 */
const createChatRoom = async (
  type,
  createdBy,
  name = null,
  avatarUrl = null,
) => {
  const result = await pool.query(
    "INSERT INTO chat_rooms (type, created_by, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *",
    [type, createdBy, name, avatarUrl],
  );
  return result.rows[0];
};

/**
 * Get all chat rooms for a specific user
 */
const getChatRoomsForUser = async (userId) => {
  const result = await pool.query(
    `SELECT cr.*,
          (SELECT COUNT(*) FROM chat_room_members WHERE room_id = cr.id) as member_count,
          lm.content as last_message,
          lm.created_at as last_message_at,
          lm.message_type as last_message_type
   FROM chat_rooms cr
   INNER JOIN chat_room_members crm ON cr.id = crm.room_id
   LEFT JOIN LATERAL (
     SELECT content, created_at, message_type
     FROM chat_messages
     WHERE room_id = cr.id
     ORDER BY created_at DESC
     LIMIT 1
   ) lm ON true
   WHERE crm.user_id = $1
   ORDER BY COALESCE(lm.created_at, cr.created_at) DESC`,
    [userId],
  );
  return result.rows;
};

/**
 * Get chat room by ID
 */
const getChatRoomById = async (roomId) => {
  const result = await pool.query(
    `SELECT cr.*, 
            (SELECT COUNT(*) FROM chat_room_members WHERE room_id = cr.id) as member_count
     FROM chat_rooms cr
     WHERE cr.id = $1`,
    [roomId],
  );
  return result.rows[0];
};

/**
 * Get chat room members with user details
 */
const getChatRoomMembers = async (roomId) => {
  const result = await pool.query(
    `SELECT crm.user_id, crm.role, crm.joined_at, u.username
     FROM chat_room_members crm
     JOIN users u ON crm.user_id = u.id
     WHERE crm.room_id = $1
     ORDER BY crm.joined_at ASC`,
    [roomId]
  );
  return result.rows;
};

/**
 * Get chat room members for notification delivery (includes Telegram fields).
 */
const getChatRoomNotificationTargets = async (roomId) => {
  const result = await pool.query(
    `SELECT u.id AS user_id,
            u.username,
            u.telegram_chat_id
     FROM chat_room_members crm
     JOIN users u ON crm.user_id = u.id
     WHERE crm.room_id = $1
       AND COALESCE(u.is_deleted, false) = false`,
    [roomId],
  );

  return result.rows;
};

/**
 * Add a member to a chat room
 */
const addMemberToRoom = async (roomId, userId, role = "member") => {
  const result = await pool.query(
    "INSERT INTO chat_room_members (room_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (room_id, user_id) DO NOTHING RETURNING *",
    [roomId, userId, role],
  );
  return result.rows[0];
};

/**
 * Remove a member from a chat room
 */
const removeMemberFromRoom = async (roomId, userId) => {
  const result = await pool.query(
    "DELETE FROM chat_room_members WHERE room_id = $1 AND user_id = $2 RETURNING *",
    [roomId, userId],
  );
  return result.rows[0];
};

/**
 * Check if user is a member of a room
 */
const isMemberOfRoom = async (roomId, userId) => {
  const result = await pool.query(
    "SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2",
    [roomId, userId],
  );
  return result.rows.length > 0;
};

/**
 * Update chat room details (name, avatar)
 */
const updateChatRoom = async (roomId, updates) => {
  const allowedFields = ["name", "avatar_url"];
  const validUpdates = {};

  for (const field of allowedFields) {
    if (field in updates) {
      validUpdates[field] = updates[field];
    }
  }

  if (Object.keys(validUpdates).length === 0) {
    return null;
  }

  const setClause = Object.keys(validUpdates)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const values = [...Object.values(validUpdates), roomId];

  const result = await pool.query(
    `UPDATE chat_rooms SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  return result.rows[0];
};

/**
 * Get or create direct chat room between two users
 */
const getOrCreateDirectRoom = async (userId1, userId2) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE chat_rooms IN SHARE ROW EXCLUSIVE MODE');

    const existingResult = await client.query(
      `SELECT cr.* FROM chat_rooms cr
       INNER JOIN chat_room_members crm1 ON cr.id = crm1.room_id AND crm1.user_id = $1
       INNER JOIN chat_room_members crm2 ON cr.id = crm2.room_id AND crm2.user_id = $2
       WHERE cr.type = 'direct'`,
      [userId1, userId2]
    );

    if (existingResult.rows.length > 0) {
      await client.query('COMMIT');
      return existingResult.rows[0];
    }

    const newRoomResult = await client.query(
      'INSERT INTO chat_rooms (type, created_by) VALUES ($1, $2) RETURNING *',
      ['direct', userId1]
    );
    const newRoom = newRoomResult.rows[0];

    await client.query(
      `INSERT INTO chat_room_members (room_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (room_id, user_id) DO NOTHING`,
      [newRoom.id, userId1]
    );

    await client.query(
      `INSERT INTO chat_room_members (room_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (room_id, user_id) DO NOTHING`,
      [newRoom.id, userId2]
    );

    await client.query('COMMIT');
    return newRoom;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getMemberRole = async (roomId, userId) => {
  const result = await pool.query(
    'SELECT role FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
    [roomId, userId]
  );
  return result.rows[0]?.role ?? null;
};

module.exports = {
  createChatRoom,
  getChatRoomsForUser,
  getChatRoomById,
  getChatRoomMembers,
  getChatRoomNotificationTargets,
  addMemberToRoom,
  removeMemberFromRoom,
  isMemberOfRoom,
  updateChatRoom,
  getOrCreateDirectRoom,
  getMemberRole,
};
