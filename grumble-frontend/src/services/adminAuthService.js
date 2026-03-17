import adminApi from './adminApi';

/**
 * Admin Authentication Service
 * Handles all admin auth-related API calls
 * Separate from user auth service
 */

/**
 * Admin login
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 */
export const login = async (username, password) => {
    const response = await adminApi.post('/login', {
        username,
        password
    });

    if (response.data.success) {
        // Store token and admin data in localStorage
        localStorage.setItem('adminToken', response.data.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
    }

    return response.data;
};

/**
 * Admin logout
 * Clears local storage and calls backend endpoint
 */
export const logout = async () => {
    try {
        await adminApi.post('/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear local storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
    }
};

/**
 * Get current admin from localStorage
 */
export const getCurrentAdmin = () => {
    const adminJson = localStorage.getItem('admin');
    if (!adminJson) return null;
    
    try {
        return JSON.parse(adminJson);
    } catch (error) {
        console.error('Error parsing admin data:', error);
        return null;
    }
};

/**
 * Get admin token from localStorage
 */
export const getAdminToken = () => {
    return localStorage.getItem('adminToken');
};

/**
 * Fetch current admin from server (to verify token and get fresh data)
 */
export const fetchCurrentAdmin = async () => {
    const response = await adminApi.get('/me');
    
    if (response.data.success) {
        // Update localStorage with fresh data
        localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
        return response.data.data.admin;
    }
    
    return null;
};

/**
 * Get admin activity logs
 * @param {object} filters - { adminId, action, page, limit }
 */
export const getAdminLogs = async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.adminId) params.append('adminId', filters.adminId);
    if (filters.action) params.append('action', filters.action);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await adminApi.get(`/logs?${params.toString()}`);
    return response.data;
};

/**
 * Get all admin accounts (superadmin only)
 */
export const getAllAdmins = async () => {
    const response = await adminApi.get('/admins');
    return response.data;
};
