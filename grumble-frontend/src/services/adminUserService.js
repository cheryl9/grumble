import adminApi from './adminApi';

/**
 * Admin User Management Service
 * API calls for user management operations
 */

/**
 * Get users with filters and pagination
 * @param {Object} filters - { page, limit, search, status, sortBy, sortOrder }
 */
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await adminApi.get(`/users?${params.toString()}`);
  return response.data.data;
};

/**
 * Get user details by ID
 * @param {number} id - User ID
 */
export const getUserDetails = async (id) => {
  const response = await adminApi.get(`/users/${id}`);
  return response.data.data;
};

/**
 * Freeze user account
 * @param {number} id - User ID
 * @param {string} reason - Reason for freezing
 */
export const freezeUser = async (id, reason) => {
  const response = await adminApi.patch(`/users/${id}/freeze`, { reason });
  return response.data;
};

/**
 * Unfreeze user account
 * @param {number} id - User ID
 */
export const unfreezeUser = async (id) => {
  const response = await adminApi.patch(`/users/${id}/unfreeze`);
  return response.data;
};

/**
 * Delete user account (soft delete)
 * @param {number} id - User ID
 * @param {string} reason - Reason for deletion (optional)
 */
export const deleteUser = async (id, reason = '') => {
  const response = await adminApi.delete(`/users/${id}`, { 
    data: { reason } 
  });
  return response.data;
};

/**
 * Search users
 * @param {string} query - Search query
 */
export const searchUsers = async (query) => {
  const response = await adminApi.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data.data;
};
