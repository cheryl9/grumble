const pool = require('../../config/db');
const bcrypt = require('bcrypt');

/**
 * Admin Repository
 * Handles database operations for admin users
 */

/**
 * Find admin by ID
 */
const findAdminById = async (adminId) => {
  const result = await pool.query(
    'SELECT id, username, email, full_name, role, is_active, last_login_at, created_at FROM admins WHERE id = $1',
    [adminId]
  );
  return result.rows[0];
};

/**
 * Find admin by username
 */
const findAdminByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM admins WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

/**
 * Find admin by email
 */
const findAdminByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM admins WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

/**
 * Verify admin credentials (username/email + password)
 */
const verifyAdminCredentials = async (identifier, password) => {
  // Check if identifier is email or username
  const isEmail = identifier.includes('@');
  
  const admin = isEmail 
    ? await findAdminByEmail(identifier)
    : await findAdminByUsername(identifier);
  
  if (!admin) {
    return null;
  }

  // Check if admin account is active
  if (!admin.is_active) {
    return null;
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, admin.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  // Return admin without password hash
  const { password_hash, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

/**
 * Update admin last login timestamp
 */
const updateLastLogin = async (adminId) => {
  const result = await pool.query(
    `UPDATE admins 
     SET last_login_at = NOW(), updated_at = NOW() 
     WHERE id = $1 
     RETURNING id, last_login_at`,
    [adminId]
  );
  return result.rows[0];
};

/**
 * Get all admins (for super admin)
 */
const getAllAdmins = async () => {
  const result = await pool.query(
    `SELECT id, username, email, full_name, role, is_active, last_login_at, created_at 
     FROM admins 
     ORDER BY created_at DESC`
  );
  return result.rows;
};

/**
 * Update admin status (activate/deactivate)
 */
const updateAdminStatus = async (adminId, isActive) => {
  const result = await pool.query(
    `UPDATE admins 
     SET is_active = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, username, is_active`,
    [isActive, adminId]
  );
  return result.rows[0];
};

/**
 * Log admin action for audit trail
 */
const logAdminAction = async (adminId, action, targetType, targetId, details, ipAddress) => {
  const result = await pool.query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [adminId, action, targetType, targetId, JSON.stringify(details), ipAddress]
  );
  return result.rows[0];
};

/**
 * Get admin activity logs
 */
const getAdminLogs = async (filters = {}) => {
  const { adminId, action, limit = 50, offset = 0 } = filters;
  
  let query = `
    SELECT 
      al.*,
      a.username as admin_username,
      a.full_name as admin_full_name
    FROM admin_logs al
    LEFT JOIN admins a ON al.admin_id = a.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 0;
  
  if (adminId) {
    paramCount++;
    params.push(adminId);
    query += ` AND al.admin_id = $${paramCount}`;
  }
  
  if (action) {
    paramCount++;
    params.push(action);
    query += ` AND al.action = $${paramCount}`;
  }
  
  query += ` ORDER BY al.created_at DESC`;
  
  paramCount++;
  params.push(limit);
  query += ` LIMIT $${paramCount}`;
  
  paramCount++;
  params.push(offset);
  query += ` OFFSET $${paramCount}`;
  
  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get admin logs count (for pagination)
 */
const getAdminLogsCount = async (filters = {}) => {
  const { adminId, action } = filters;
  
  let query = 'SELECT COUNT(*) FROM admin_logs WHERE 1=1';
  const params = [];
  let paramCount = 0;
  
  if (adminId) {
    paramCount++;
    params.push(adminId);
    query += ` AND admin_id = $${paramCount}`;
  }
  
  if (action) {
    paramCount++;
    params.push(action);
    query += ` AND action = $${paramCount}`;
  }
  
  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count);
};

/**
 * Verify password against hash
 */
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Update admin password
 */
const updateAdminPassword = async (adminId, newPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  const result = await pool.query(
    `UPDATE admins 
     SET password_hash = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING id`,
    [hashedPassword, adminId]
  );
  
  return result.rows[0];
};

module.exports = {
  findAdminById,
  findAdminByUsername,
  findAdminByEmail,
  verifyAdminCredentials,
  updateLastLogin,
  getAllAdmins,
  updateAdminStatus,
  logAdminAction,
  getAdminLogs,
  getAdminLogsCount,
  verifyPassword,
  updateAdminPassword
};
