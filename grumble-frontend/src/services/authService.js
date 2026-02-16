import api from './api';

/**
 * Authentication service
 * Handles all auth-related API calls
 */

/**
 * Register a new user
 * @param {string} phoneNumber - User's phone number (8 digits)
 * @param {string} username - User's username
 * @param {string} password - User's password
 */
export const register = async (phoneNumber, username, password) => {
    const response = await api.post('/auth/register', {
        phoneNumber,
        username,
        password
    });

    if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
};

/**
 * Login user
 * @param {string} username - User's username
 * @param {string} password - User's password
 */
export const login = async (username, password) => {
    const response = await api.post('/auth/login', {
        username,
        password
    });

    if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
};

/**
 * Logout user
 * Clears local storage and calls backend endpoint
 */
export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
};

/**
 * Request password reset
 * @param {string} phoneNumber - User's phone number
 */
export const forgotPassword = async (phoneNumber) => {
    const response = await api.post('/auth/forgot-password', {
        phoneNumber
    });
    return response.data;
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 */
export const resetPassword = async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
        token,
        newPassword
    });
    return response.data;
};

/**
 * Get current user from local storage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get auth token from local storage
 */
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getAuthToken();
};

export default {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    getAuthToken,
    isAuthenticated
};
