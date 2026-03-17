import adminApi from './adminApi';

/**
 * Admin FAQ Service - Frontend API wrapper for FAQ management
 */

/**
 * Get all FAQs with optional filters
 */
export async function getFAQs(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.category) params.append('category', filters.category);
  if (filters.active !== undefined) params.append('active', filters.active);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await adminApi.get(`/faqs?${params.toString()}`);
  return response.data;
}

/**
 * Get single FAQ by ID
 */
export async function getFAQById(id) {
  const response = await adminApi.get(`/faqs/${id}`);
  return response.data;
}

/**
 * Create new FAQ
 */
export async function createFAQ(data) {
  const response = await adminApi.post('/faqs', data);
  return response.data;
}

/**
 * Update FAQ
 */
export async function updateFAQ(id, data) {
  const response = await adminApi.patch(`/faqs/${id}`, data);
  return response.data;
}

/**
 * Delete FAQ
 */
export async function deleteFAQ(id) {
  const response = await adminApi.delete(`/faqs/${id}`);
  return response.data;
}

/**
 * Toggle FAQ active status
 */
export async function toggleFAQStatus(id, isActive) {
  const response = await adminApi.patch(`/faqs/${id}/toggle`, { is_active: isActive });
  return response.data;
}

/**
 * Reorder FAQs
 */
export async function reorderFAQs(orders) {
  const response = await adminApi.patch('/faqs/reorder', { orders });
  return response.data;
}

/**
 * Get FAQ categories
 */
export async function getFAQCategories() {
  const response = await adminApi.get('/faqs/categories');
  return response.data;
}

/**
 * Get admin activity logs
 */
export async function getAdminLogs(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.adminId) params.append('adminId', filters.adminId);
  if (filters.action) params.append('action', filters.action);
  if (filters.targetType) params.append('targetType', filters.targetType);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await adminApi.get(`/logs?${params.toString()}`);
  return response.data;
}

/**
 * Get current admin profile
 */
export async function getCurrentAdmin() {
  const response = await adminApi.get('/me');
  return response.data;
}

/**
 * Change admin password
 */
export async function changeAdminPassword(currentPassword, newPassword) {
  const response = await adminApi.post('/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
}

/**
 * Get all admins (superadmin only)
 */
export async function getAllAdmins() {
  const response = await adminApi.get('/admins');
  return response.data;
}
