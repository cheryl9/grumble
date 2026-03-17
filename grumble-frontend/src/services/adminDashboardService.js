import adminApi from './adminApi';

/**
 * Admin Dashboard Service
 * API calls for dashboard analytics and metrics
 */

/**
 * Get dashboard statistics
 */
export const getStats = async () => {
  const response = await adminApi.get('/dashboard/stats');
  return response.data.data;
};

/**
 * Get user growth data
 * @param {number} months - Number of months to fetch (default 12)
 */
export const getUserGrowth = async (months = 12) => {
  const response = await adminApi.get(`/dashboard/growth?months=${months}`);
  return response.data.data;
};

/**
 * Get engagement metrics
 */
export const getEngagementMetrics = async () => {
  const response = await adminApi.get('/dashboard/engagement');
  return response.data.data;
};

/**
 * Get streak statistics
 */
export const getStreakStats = async () => {
  const response = await adminApi.get('/dashboard/streaks');
  return response.data.data;
};

/**
 * Get top active users
 * @param {number} limit - Number of users to fetch (default 10)
 */
export const getTopUsers = async (limit = 10) => {
  const response = await adminApi.get(`/dashboard/top-users?limit=${limit}`);
  return response.data.data;
};
