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
    // ==================== ORIGINAL CODE (UNCOMMENT WHEN BACKEND IS READY) ====================
    // const response = await api.post('/auth/forgot-password/send-otp', {
    //     phoneNumber
    // });
    // return response.data;
    // ========================================================================================

    // ⚠️ TEMPORARY MOCK - DELETE THIS SECTION WHEN BACKEND IS READY ⚠️
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return { success: true, message: 'OTP sent (mocked)' }; // Fake success response
    // ⚠️ END OF MOCK - DELETE ABOVE ⚠️
};

/**
 * Verify OTP for password reset
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - 6-digit OTP code
 */
export const verifyPasswordResetOTP = async (phoneNumber, otp) => {
    // ==================== ORIGINAL CODE (UNCOMMENT WHEN BACKEND IS READY) ====================
    // const response = await api.post('/auth/forgot-password/verify-otp', {
    //     phoneNumber,
    //     otp
    // });
    // return response.data;
    // ========================================================================================

    // ⚠️ TEMPORARY MOCK - DELETE THIS SECTION WHEN BACKEND IS READY ⚠️
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return { success: true, message: 'OTP verified (mocked)' }; // Fake success response
    // ⚠️ END OF MOCK - DELETE ABOVE ⚠️
};

/**
 * Reset password with verified OTP
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - Verified OTP code
 * @param {string} newPassword - New password
 */
export const resetPasswordWithOTP = async (phoneNumber, otp, newPassword) => {
    // ==================== ORIGINAL CODE (UNCOMMENT WHEN BACKEND IS READY) ====================
    // const response = await api.post('/auth/forgot-password/reset', {
    //     phoneNumber,
    //     otp,
    //     newPassword
    // });
    // return response.data;
    // ========================================================================================

    // ⚠️ TEMPORARY MOCK - DELETE THIS SECTION WHEN BACKEND IS READY ⚠️
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return { success: true, message: 'Password reset (mocked)' }; // Fake success response
    // ⚠️ END OF MOCK - DELETE ABOVE ⚠️
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
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPasswordWithOTP,
    getCurrentUser,
    getAuthToken,
    isAuthenticated
};
