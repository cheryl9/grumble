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
 * Send OTP for password reset
 * @param {string} phoneNumber - User's phone number
 */
export const sendPasswordResetOTP = async (phoneNumber) => {
    const response = await api.post('/auth/forgot-password/send-otp', {
        phoneNumber
    });
    return response.data;
};

/**
 * Verify OTP for password reset
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - 6-digit OTP code
 */
export const verifyPasswordResetOTP = async (phoneNumber, otp) => {
    const response = await api.post('/auth/forgot-password/verify-otp', {
        phoneNumber,
        otp
    });
    return response.data;
};

/**
 * Reset password with verified OTP
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - Verified OTP code
 * @param {string} newPassword - New password
 */
export const resetPasswordWithOTP = async (phoneNumber, otp, newPassword) => {
    const response = await api.post('/auth/forgot-password/reset', {
        phoneNumber,
        otp,
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
 * Fetch current user from server (with latest Telegram connection status)
 */
export const fetchCurrentUser = async () => {
    const response = await api.get('/auth/user');
    
    if (response.data.success) {
        // Update local storage with fresh user data
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data.user;
    }
    
    return null;
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

/**
 * Connect Telegram account
 * @param {string} chatId - Telegram chat ID
 */
export const connectTelegram = async (chatId) => {
    const response = await api.post('/auth/telegram/connect', {
        chatId
    });
    return response.data;
};

/**
 * Disconnect Telegram account
 */
export const disconnectTelegram = async () => {
    const response = await api.post('/auth/telegram/disconnect');
    return response.data;
};

export default {
    register,
    login,
    logout,
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPasswordWithOTP,
    getCurrentUser,
    fetchCurrentUser,
    getAuthToken,
    isAuthenticated,
    connectTelegram,
    disconnectTelegram
};
