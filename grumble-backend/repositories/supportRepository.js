const pool = require("../config/db");

/**
 * Create a support report
 */
const createReport = async (userId, category, description, contactEmail) => {
  const result = await pool.query(
    `INSERT INTO support_reports (user_id, category, description, contact_email, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, user_id, category, description, contact_email, status, created_at`,
    [userId, category, description, contactEmail || null],
  );
  return result.rows[0];
};

/**
 * Get all support reports (admin only)
 */
const getAllReports = async (limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT 
      sr.id, sr.user_id, sr.category, sr.description, sr.contact_email,
      sr.status, sr.admin_notes, sr.created_at, sr.updated_at, sr.resolved_at,
      u.username, u.phone_number
     FROM support_reports sr
     LEFT JOIN users u ON u.id = sr.user_id
     ORDER BY sr.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
};

/**
 * Get reports by status (admin only)
 */
const getReportsByStatus = async (status, limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT 
      sr.id, sr.user_id, sr.category, sr.description, sr.contact_email,
      sr.status, sr.admin_notes, sr.created_at, sr.updated_at, sr.resolved_at,
      u.username, u.phone_number
     FROM support_reports sr
     LEFT JOIN users u ON u.id = sr.user_id
     WHERE sr.status = $1
     ORDER BY sr.created_at DESC
     LIMIT $2 OFFSET $3`,
    [status, limit, offset],
  );
  return result.rows;
};

/**
 * Get a single report by ID
 */
const getReportById = async (reportId) => {
  const result = await pool.query(
    `SELECT 
      sr.id, sr.user_id, sr.category, sr.description, sr.contact_email,
      sr.status, sr.admin_notes, sr.created_at, sr.updated_at, sr.resolved_at,
      u.username, u.phone_number, u.email
     FROM support_reports sr
     LEFT JOIN users u ON u.id = sr.user_id
     WHERE sr.id = $1`,
    [reportId],
  );
  return result.rows[0] || null;
};

/**
 * Update report status and add admin notes
 */
const updateReportStatus = async (reportId, status, adminNotes = null) => {
  let query = `UPDATE support_reports 
              SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP`;
  const params = [status, adminNotes];

  // If resolving, set resolved_at timestamp
  if (status === "resolved") {
    query += `, resolved_at = CURRENT_TIMESTAMP`;
  }

  query += ` WHERE id = $3 RETURNING *`;
  params.push(reportId);

  const result = await pool.query(query, params);
  return result.rows[0] || null;
};

/**
 * Get report count by status
 */
const getReportCountByStatus = async (status = null) => {
  let query = `SELECT COUNT(*) as count FROM support_reports`;
  const params = [];

  if (status) {
    query += ` WHERE status = $1`;
    params.push(status);
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count, 10);
};

module.exports = {
  createReport,
  getAllReports,
  getReportsByStatus,
  getReportById,
  updateReportStatus,
  getReportCountByStatus,
};
