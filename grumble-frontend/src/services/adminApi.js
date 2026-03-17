import axios from 'axios';

/**
 * Admin API Service
 * Axios instance configured for admin panel API calls
 * Separate from user API for security isolation
 */

// Create axios instance with base URL
const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/admin`
        : 'http://localhost:5001/api/admin',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add admin JWT token to requests
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Admin token expired or invalid - clear auth data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin');

            // Redirect to admin login if not already there
            if (window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        
        if (error.response?.status === 403) {
            // Forbidden - insufficient permissions
            console.error('Access denied: Insufficient admin permissions');
        }
        
        return Promise.reject(error);
    }
);

export default adminApi;
