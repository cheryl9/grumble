const pool = require('../../config/db');

/**
 * User Management Repository
 * Database operations for admin user management
 */

/**
 * Get users with filters and pagination
 * @param {Object} filters - { search, status, page, limit, sortBy, sortOrder }
 */
const getUsers = async (filters = {}) => {
  const {
    search = '',
    status = 'all',
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = filters;

  const offset = (page - 1) * limit;
  
  // Build WHERE clause
  let whereConditions = [];
  let queryParams = [];
  let paramIndex = 1;

  // Search filter
  if (search) {
    queryParams.push(`%${search}%`);
    whereConditions.push(`(
      u.username ILIKE $${paramIndex} OR 
      u.phone_number ILIKE $${paramIndex} OR 
      u.telegram_username ILIKE $${paramIndex}
    )`);
    paramIndex++;
  }

  // Status filter
  if (status !== 'all') {
    queryParams.push(status);
    whereConditions.push(`u.account_status = $${paramIndex}`);
    paramIndex++;
  } else {
    // Exclude soft-deleted users by default
    whereConditions.push(`u.is_deleted = false`);
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Validate sortBy to prevent SQL injection
  const validSortColumns = ['created_at', 'updated_at', 'username', 'phone_number', 'last_active_at'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const orderByClause = sortColumn === 'last_active_at'
    ? `ORDER BY last_active_at ${sortDirection} NULLS LAST`
    : `ORDER BY u.${sortColumn} ${sortDirection}`;

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM users u
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult.rows[0].total);

  // Get users
  queryParams.push(limit, offset);
  const usersQuery = `
    SELECT 
      u.id,
      u.username,
      u.phone_number,
      u.account_status,
      u.frozen_at,
      u.frozen_reason,
      u.is_deleted,
      u.deleted_at,
      u.created_at,
      u.updated_at,
      u.telegram_chat_id,
      u.telegram_username,
      u.telegram_first_name,
      u.telegram_connected_at,
      la.last_active_at,
      COALESCE(us.current_streak, 0) as current_streak,
      COALESCE(p.post_count, 0) as post_count,
      COALESCE(f.friend_count, 0) as friend_count
    FROM users u
    LEFT JOIN user_streaks us ON u.id = us.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as post_count
      FROM posts
      WHERE is_deleted = false
      GROUP BY user_id
    ) p ON u.id = p.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as friend_count
      FROM friendships
      WHERE status = 'accepted'
      GROUP BY user_id
    ) f ON u.id = f.user_id
    LEFT JOIN (
      SELECT user_id, MAX(created_at) as last_active_at
      FROM posts
      WHERE is_deleted = false
      GROUP BY user_id
    ) la ON u.id = la.user_id
    ${whereClause}
    ${orderByClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const usersResult = await pool.query(usersQuery, queryParams);

  return {
    users: usersResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get user by ID with full details
 * @param {number} id - User ID
 */
const getUserById = async (id) => {
  const result = await pool.query(`
    SELECT 
      u.*,
      COALESCE(us.current_streak, 0) as current_streak,
      COALESCE(us.longest_streak, 0) as longest_streak,
      us.last_post_date
    FROM users u
    LEFT JOIN user_streaks us ON u.id = us.user_id
    WHERE u.id = $1
  `, [id]);

  return result.rows[0];
};

/**
 * Get user statistics
 * @param {number} userId - User ID
 */
const getUserStats = async (userId) => {
  const result = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM posts WHERE user_id = $1 AND is_deleted = false) as posts_count,
      (SELECT COUNT(*) FROM friendships WHERE user_id = $1 AND status = 'accepted') as friends_count,
      (SELECT COUNT(*) FROM likes WHERE user_id = $1) as likes_given,
      (SELECT COUNT(*) FROM comments WHERE user_id = $1 AND is_deleted = false) as comments_count,
      COALESCE(us.current_streak, 0) as current_streak,
      COALESCE(us.longest_streak, 0) as longest_streak,
      us.last_post_date
    FROM users u
    LEFT JOIN user_streaks us ON u.id = us.user_id
    WHERE u.id = $1
  `, [userId]);

  return result.rows[0];
};

/**
 * Get user's recent posts
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to return
 */
const getUserPosts = async (userId, limit = 5) => {
  const result = await pool.query(`
    SELECT 
      p.id,
      p.location_name,
      p.rating,
      p.image_url,
      p.description,
      p.visibility,
      p.likes_count,
      p.comments_count,
      p.created_at,
      fp.name as food_place_name
    FROM posts p
    LEFT JOIN food_places fp ON p.food_place_id = fp.id
    WHERE p.user_id = $1 AND p.is_deleted = false
    ORDER BY p.created_at DESC
    LIMIT $2
  `, [userId, limit]);

  return result.rows;
};

/**
 * Get user's friends
 * @param {number} userId - User ID
 */
const getUserFriends = async (userId) => {
  const result = await pool.query(`
    SELECT 
      u.id,
      u.username,
      u.phone_number,
      u.telegram_username,
      f.created_at as friends_since,
      COALESCE(us.current_streak, 0) as current_streak
    FROM friendships f
    JOIN users u ON (
      CASE 
        WHEN f.user_id = $1 THEN u.id = f.friend_id
        ELSE u.id = f.user_id
      END
    )
    LEFT JOIN user_streaks us ON u.id = us.user_id
    WHERE (f.user_id = $1 OR f.friend_id = $1) 
      AND f.status = 'accepted'
      AND u.is_deleted = false
    ORDER BY f.created_at DESC
  `, [userId]);

  return result.rows;
};

/**
 * Freeze user account
 * @param {number} id - User ID
 * @param {string} reason - Reason for freezing
 * @param {number} adminId - Admin ID performing the action
 */
const freezeUser = async (id, reason, adminId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update user status
    const result = await client.query(`
      UPDATE users
      SET 
        account_status = 'frozen',
        frozen_at = NOW(),
        frozen_reason = $1,
        updated_at = NOW()
      WHERE id = $2 AND is_deleted = false
      RETURNING id, username, account_status, frozen_at
    `, [reason, id]);

    if (result.rows.length === 0) {
      throw new Error('User not found or already deleted');
    }

    // Log the action
    await client.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES ($1, 'user_frozen', 'user', $2, $3)
    `, [adminId, id, JSON.stringify({ reason })]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Unfreeze user account
 * @param {number} id - User ID
 * @param {number} adminId - Admin ID performing the action
 */
const unfreezeUser = async (id, adminId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update user status
    const result = await client.query(`
      UPDATE users
      SET 
        account_status = 'active',
        frozen_at = NULL,
        frozen_reason = NULL,
        updated_at = NOW()
      WHERE id = $1 AND is_deleted = false
      RETURNING id, username, account_status
    `, [id]);

    if (result.rows.length === 0) {
      throw new Error('User not found or already deleted');
    }

    // Log the action
    await client.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES ($1, 'user_unfrozen', 'user', $2, $3)
    `, [adminId, id, JSON.stringify({})]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Soft delete user account
 * @param {number} id - User ID
 * @param {number} adminId - Admin ID performing the action
 * @param {string} reason - Reason for deletion
 */
const deleteUser = async (id, adminId, reason = '') => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Soft delete user
    const result = await client.query(`
      UPDATE users
      SET 
        is_deleted = true,
        deleted_at = NOW(),
        account_status = 'deleted',
        updated_at = NOW()
      WHERE id = $1 AND is_deleted = false
      RETURNING id, username, is_deleted, deleted_at
    `, [id]);

    if (result.rows.length === 0) {
      throw new Error('User not found or already deleted');
    }

    // Log the action
    await client.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES ($1, 'user_deleted', 'user', $2, $3)
    `, [adminId, id, JSON.stringify({ reason })]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Search users by query
 * @param {string} query - Search query
 * @param {number} limit - Max results to return
 */
const searchUsers = async (query, limit = 20) => {
  const result = await pool.query(`
    SELECT 
      id,
      username,
      phone_number,
      telegram_username,
      account_status,
      created_at
    FROM users
    WHERE (
      username ILIKE $1 OR 
      phone_number ILIKE $1 OR 
      telegram_username ILIKE $1
    ) AND is_deleted = false
    ORDER BY username ASC
    LIMIT $2
  `, [`%${query}%`, limit]);

  return result.rows;
};

module.exports = {
  getUsers,
  getUserById,
  getUserStats,
  getUserPosts,
  getUserFriends,
  freezeUser,
  unfreezeUser,
  deleteUser,
  searchUsers
};
