const pool = require('../../config/db');

/**
 * Post Management Repository
 * Database operations for admin post/comment moderation
 */

const getPosts = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    visibility = 'all',
    search = '',
    fromDate,
    toDate,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = filters;

  const offset = (page - 1) * limit;

  const whereConditions = ['p.is_deleted = false'];
  const params = [];
  let paramIndex = 1;

  if (visibility !== 'all') {
    params.push(visibility);
    whereConditions.push(`p.visibility = $${paramIndex}`);
    paramIndex++;
  }

  if (search) {
    params.push(`%${search}%`);
    whereConditions.push(`(
      p.location_name ILIKE $${paramIndex} OR
      p.description ILIKE $${paramIndex} OR
      u.username ILIKE $${paramIndex}
    )`);
    paramIndex++;
  }

  if (fromDate) {
    params.push(fromDate);
    whereConditions.push(`p.created_at >= $${paramIndex}`);
    paramIndex++;
  }

  if (toDate) {
    params.push(toDate);
    whereConditions.push(`p.created_at <= $${paramIndex}`);
    paramIndex++;
  }

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

  const validSortColumns = ['created_at', 'likes_count', 'comments_count', 'rating'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = countResult.rows[0].total;

  params.push(limit, offset);
  const postsQuery = `
    SELECT
      p.id,
      p.user_id,
      p.food_place_id,
      p.location_name,
      p.rating,
      p.image_url,
      p.description,
      p.visibility,
      p.likes_count,
      p.comments_count,
      p.saves_count,
      p.created_at,
      p.updated_at,
      u.username,
      u.phone_number,
      fp.name as food_place_name,
      COALESCE(r.report_count, 0)::int as report_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN food_places fp ON p.food_place_id = fp.id
    LEFT JOIN (
      SELECT reported_post_id, COUNT(*) as report_count
      FROM reports
      WHERE reported_post_id IS NOT NULL
      GROUP BY reported_post_id
    ) r ON p.id = r.reported_post_id
    ${whereClause}
    ORDER BY p.${sortColumn} ${sortDirection}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const postsResult = await pool.query(postsQuery, params);

  return {
    posts: postsResult.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getPostById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      p.*,
      u.username,
      u.phone_number,
      u.telegram_username,
      fp.name as food_place_name,
      fp.category as food_place_category,
      fp.cuisine as food_place_cuisine
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN food_places fp ON p.food_place_id = fp.id
    WHERE p.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const deletePost = async (id, adminId, reason = '') => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `
      UPDATE posts
      SET is_deleted = true,
          deleted_at = NOW(),
          updated_at = NOW()
      WHERE id = $1 AND is_deleted = false
      RETURNING id, user_id, location_name
      `,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Post not found or already deleted');
    }

    await client.query(
      `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES ($1, 'post_deleted', 'post', $2, $3)
      `,
      [adminId, id, JSON.stringify({ reason })]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getPostComments = async (postId) => {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.post_id,
      c.user_id,
      c.content,
      c.is_deleted,
      c.deleted_at,
      c.created_at,
      u.username,
      u.phone_number
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at DESC
    `,
    [postId]
  );

  return result.rows;
};

const deleteComment = async (id, adminId, reason = '') => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `
      UPDATE comments
      SET is_deleted = true,
          deleted_at = NOW()
      WHERE id = $1 AND is_deleted = false
      RETURNING id, post_id, user_id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Comment not found or already deleted');
    }

    await client.query(
      `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES ($1, 'comment_deleted', 'comment', $2, $3)
      `,
      [adminId, id, JSON.stringify({ reason, postId: result.rows[0].post_id })]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getPostReports = async (postId) => {
  const result = await pool.query(
    `
    SELECT
      r.id,
      r.reason,
      r.description,
      r.status,
      r.reviewed_at,
      r.admin_notes,
      r.created_at,
      reporter.username as reporter_username,
      reviewer.username as reviewer_username
    FROM reports r
    LEFT JOIN users reporter ON r.reporter_id = reporter.id
    LEFT JOIN admins reviewer ON r.reviewed_by = reviewer.id
    WHERE r.reported_post_id = $1
    ORDER BY r.created_at DESC
    `,
    [postId]
  );

  return result.rows;
};

module.exports = {
  getPosts,
  getPostById,
  deletePost,
  getPostComments,
  deleteComment,
  getPostReports
};
