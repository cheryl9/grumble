import adminApi from './adminApi';

/**
 * Admin Post Service
 * API calls for post/comment moderation
 */

export const getPosts = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.visibility) params.append('visibility', filters.visibility);
  if (filters.search) params.append('search', filters.search);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await adminApi.get(`/posts?${params.toString()}`);
  return response.data.data;
};

export const getPostDetails = async (id) => {
  const response = await adminApi.get(`/posts/${id}`);
  return response.data.data;
};

export const deletePost = async (id, reason = '') => {
  const response = await adminApi.delete(`/posts/${id}`, {
    data: { reason }
  });
  return response.data;
};

export const deleteComment = async (id, reason = '') => {
  const response = await adminApi.delete(`/comments/${id}`, {
    data: { reason }
  });
  return response.data;
};

export default {
  getPosts,
  getPostDetails,
  deletePost,
  deleteComment
};
