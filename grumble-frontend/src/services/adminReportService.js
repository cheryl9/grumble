import adminApi from './adminApi';

/**
 * Admin Report Service
 * API calls for report moderation workflow
 */

export const getReports = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.status) params.append('status', filters.status);
  if (filters.reason) params.append('reason', filters.reason);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await adminApi.get(`/reports?${params.toString()}`);
  return response.data.data;
};

export const getReportDetails = async (id) => {
  const response = await adminApi.get(`/reports/${id}`);
  return response.data.data;
};

export const reviewReport = async (id, notes = '') => {
  const response = await adminApi.patch(`/reports/${id}/review`, { notes });
  return response.data;
};

export const resolveReport = async (id, notes = '') => {
  const response = await adminApi.patch(`/reports/${id}/resolve`, { notes });
  return response.data;
};

export const dismissReport = async (id, notes = '') => {
  const response = await adminApi.patch(`/reports/${id}/dismiss`, { notes });
  return response.data;
};

export default {
  getReports,
  getReportDetails,
  reviewReport,
  resolveReport,
  dismissReport
};
