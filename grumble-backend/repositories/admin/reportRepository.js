const pool = require('../../config/db');

/**
 * Report Repository
 * Database operations for report moderation workflows
 */

const getReports = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    status = 'all',
    reason = '',
    sortOrder = 'DESC'
  } = filters;

  const offset = (page - 1) * limit;
  const whereConditions = ['1=1'];
  const params = [];
  let paramIndex = 1;

  if (status !== 'all') {
    params.push(status);
    whereConditions.push(`r.status = $${paramIndex}`);
    paramIndex++;
  }

  if (reason) {
    params.push(`%${reason}%`);
    whereConditions.push(`r.reason ILIKE $${paramIndex}`);
    paramIndex++;
  }

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
  const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM reports r
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, params);
  const total = countResult.rows[0].total;

  params.push(limit, offset);
  const reportsQuery = `
    SELECT
      r.id,
      r.reporter_id,
      r.reported_post_id,
      r.reported_comment_id,
      r.reported_user_id,
      r.reason,
      r.description,
      r.status,
      r.reviewed_by,
      r.reviewed_at,
      r.admin_notes,
      r.created_at,
      reporter.username as reporter_username,
      reviewer.username as reviewer_username,
      CASE
        WHEN r.reported_post_id IS NOT NULL THEN 'post'
        WHEN r.reported_comment_id IS NOT NULL THEN 'comment'
        WHEN r.reported_user_id IS NOT NULL THEN 'user'
        ELSE 'unknown'
      END as reported_type
    FROM reports r
    LEFT JOIN users reporter ON r.reporter_id = reporter.id
    LEFT JOIN admins reviewer ON r.reviewed_by = reviewer.id
    ${whereClause}
    ORDER BY r.created_at ${direction}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const reportsResult = await pool.query(reportsQuery, params);

  return {
    reports: reportsResult.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getReportById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      r.*,
      reporter.username as reporter_username,
      reviewer.username as reviewer_username,
      rp.location_name as reported_post_location,
      rp.description as reported_post_description,
      rc.content as reported_comment_content,
      ru.username as reported_username
    FROM reports r
    LEFT JOIN users reporter ON r.reporter_id = reporter.id
    LEFT JOIN admins reviewer ON r.reviewed_by = reviewer.id
    LEFT JOIN posts rp ON r.reported_post_id = rp.id
    LEFT JOIN comments rc ON r.reported_comment_id = rc.id
    LEFT JOIN users ru ON r.reported_user_id = ru.id
    WHERE r.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const updateReportStatus = async (id, status, notes, adminId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `
      UPDATE reports
      SET status = $1,
          admin_notes = COALESCE($2, admin_notes),
          reviewed_by = $3,
          reviewed_at = NOW()
      WHERE id = $4
      RETURNING id, status, reviewed_by, reviewed_at, admin_notes
      `,
      [status, notes || null, adminId, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Report not found');
    }

    await client.query(
      `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES ($1, 'report_status_updated', 'report', $2, $3)
      `,
      [adminId, id, JSON.stringify({ status, notes: notes || '' })]
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

const getReportsByStatus = async (status) => {
  const result = await pool.query(
    `
    SELECT id, reason, description, status, created_at
    FROM reports
    WHERE status = $1
    ORDER BY created_at DESC
    `,
    [status]
  );

  return result.rows;
};

const getReportsCount = async () => {
  const totalResult = await pool.query('SELECT COUNT(*)::int as total FROM reports');
  const statusBreakdownResult = await pool.query(
    `
    SELECT status, COUNT(*)::int as count
    FROM reports
    GROUP BY status
    `
  );

  return {
    total: totalResult.rows[0].total,
    byStatus: statusBreakdownResult.rows
  };
};

module.exports = {
  getReports,
  getReportById,
  updateReportStatus,
  getReportsByStatus,
  getReportsCount
};
