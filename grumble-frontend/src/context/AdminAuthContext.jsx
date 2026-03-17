import { createContext, useContext, useState, useEffect } from 'react';
import * as adminAuthService from '../services/adminAuthService';

const AdminAuthContext = createContext(null);

/**
 * Admin Authentication Context
 * Manages admin login state separately from user auth
 */
export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load admin from local storage on mount
    useEffect(() => {
        const loadAdmin = async () => {
            try {
                const currentAdmin = adminAuthService.getCurrentAdmin();
                const token = adminAuthService.getAdminToken();

                if (currentAdmin && token) {
                    // Set admin from localStorage first (for immediate UI)
                    setAdmin(currentAdmin);
                    setIsAuthenticated(true);
                    
                    // Then verify token is still valid by fetching fresh data
                    try {
                        const freshAdmin = await adminAuthService.fetchCurrentAdmin();
                        if (freshAdmin) {
                            setAdmin(freshAdmin);
                        }
                    } catch (error) {
                        console.error('Error fetching fresh admin data:', error);
                        // If token is invalid, clear auth
                        if (error.response?.status === 401) {
                            adminAuthService.logout();
                            setAdmin(null);
                            setIsAuthenticated(false);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading admin:', error);
                // Clear invalid data
                adminAuthService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        loadAdmin();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await adminAuthService.login(username, password);
            if (response.success) {
                setAdmin(response.data.admin);
                setIsAuthenticated(true);
                return response;
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await adminAuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAdmin(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        admin,
        setAdmin, // Expose setAdmin for updating admin data
        isAuthenticated,
        isLoading,
        login,
        logout
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export default AdminAuthContext;
