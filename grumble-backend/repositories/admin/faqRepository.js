const pool = require('../../config/db');

/**
 * FAQ Repository - Manages FAQ CRUD operations and queries
 */

/**
 * Get all FAQs with optional filters
 * @param {Object} filters - { category, active, search, page, limit, sortBy, sortOrder }
 */
async function getFAQs(filters = {}) {
  const { category = 'all', active = true, search = '', page = 1, limit = 20, sortBy = 'display_order', sortOrder = 'ASC' } = filters;

  let query = 'SELECT * FROM faqs WHERE 1=1';
  const params = [];

  // Filter by active status
  if (active !== 'all') {
    query += ' AND is_active = $' + (params.length + 1);
    params.push(active === 'true' || active === true);
  }

  // Filter by category
  if (category && category !== 'all') {
    query += ' AND category = $' + (params.length + 1);
    params.push(category);
  }

  // Search in question and answer
  if (search) {
    query += ` AND (question ILIKE $${params.length + 1} OR answer ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }

  // Count total
  const countResult = await pool.query(
    query.replace('SELECT *', 'SELECT COUNT(*)'),
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Add sorting and pagination
  const validSortFields = ['display_order', 'created_at', 'updated_at'];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'display_order';
  const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  query += ` ORDER BY ${safeSortBy} ${validSortOrder}`;
  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, (page - 1) * limit);

  const result = await pool.query(query, params);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single FAQ by ID
 */
async function getFAQById(id) {
  const result = await pool.query(
    `SELECT f.*, a.username as created_by_username 
     FROM faqs f
     LEFT JOIN admins a ON f.created_by = a.id
     WHERE f.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Get FAQs by category
 */
async function getFAQsByCategory(category) {
  const result = await pool.query(
    `SELECT * FROM faqs 
     WHERE category = $1 AND is_active = true
     ORDER BY display_order ASC`,
    [category]
  );

  return result.rows;
}

/**
 * Create new FAQ
 */
async function createFAQ(data, adminId) {
  const { question, answer, category, display_order = 0, is_active = true } = data;

  const result = await pool.query(
    `INSERT INTO faqs (question, answer, category, display_order, is_active, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [question, answer, category, display_order, is_active, adminId]
  );

  return result.rows[0];
}

/**
 * Update FAQ
 */
async function updateFAQ(id, data) {
  const { question, answer, category, is_active, display_order } = data;

  const updates = [];
  const params = [];
  let paramCount = 1;

  if (question !== undefined) {
    updates.push(`question = $${paramCount++}`);
    params.push(question);
  }
  if (answer !== undefined) {
    updates.push(`answer = $${paramCount++}`);
    params.push(answer);
  }
  if (category !== undefined) {
    updates.push(`category = $${paramCount++}`);
    params.push(category);
  }
  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    params.push(is_active);
  }
  if (display_order !== undefined) {
    updates.push(`display_order = $${paramCount++}`);
    params.push(display_order);
  }

  updates.push(`updated_at = NOW()`);

  params.push(id);

  const result = await pool.query(
    `UPDATE faqs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    params
  );

  return result.rows[0] || null;
}

/**
 * Delete FAQ (soft or hard delete based on admin_id context)
 */
async function deleteFAQ(id, adminId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get FAQ for audit log
    const faqResult = await client.query('SELECT * FROM faqs WHERE id = $1', [id]);
    if (!faqResult.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    // Delete FAQ
    const deleteResult = await client.query(
      'DELETE FROM faqs WHERE id = $1 RETURNING *',
      [id]
    );

    // Log the action
    await client.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, 'faq_deleted', 'faq', id, JSON.stringify({ question: faqResult.rows[0].question })]
    );

    await client.query('COMMIT');
    return deleteResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reorder FAQs - Update display_order for multiple FAQs
 * @param {Array} orders - [{ id, display_order }, ...]
 */
async function reorderFAQs(orders, adminId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const { id, display_order } of orders) {
      await client.query(
        'UPDATE faqs SET display_order = $1, updated_at = NOW() WHERE id = $2',
        [display_order, id]
      );
    }

    // Log the reorder action
    await client.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, details)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'faq_reordered', 'faq', JSON.stringify({ count: orders.length })]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Toggle FAQ active status
 */
async function toggleFAQStatus(id, isActive, adminId) {
  const result = await pool.query(
    `UPDATE faqs SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [isActive, id]
  );

  // Log the action
  await pool.query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminId, 'faq_toggled', 'faq', id, JSON.stringify({ is_active: isActive })]
  );

  return result.rows[0] || null;
}

/**
 * Get FAQ categories (unique categories from database)
 */
async function getFAQCategories() {
  const result = await pool.query(
    `SELECT DISTINCT category FROM faqs WHERE category IS NOT NULL ORDER BY category`
  );
  return result.rows.map(row => row.category);
}

module.exports = {
  getFAQs,
  getFAQById,
  getFAQsByCategory,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
  toggleFAQStatus,
  getFAQCategories,
};
