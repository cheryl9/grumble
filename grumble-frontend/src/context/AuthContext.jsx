import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from local storage on mount, then sync with server
    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                const token = authService.getAuthToken();

                if (currentUser && token) {
                    // Set user from localStorage first (for immediate UI)
                    setUser(currentUser);
                    setIsAuthenticated(true);
                    
                    // Then fetch fresh data from server (to sync Telegram connection status)
                    try {
                        const freshUser = await authService.fetchCurrentUser();
                        if (freshUser) {
                            setUser(freshUser);
                        }
                    } catch (error) {
                        console.error('Error fetching fresh user data:', error);
                        // Keep using localStorage data if server fetch fails
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error);
                // Clear invalid data
                authService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return response;
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (phoneNumber, username, password) => {
        try {
            const response = await authService.register(phoneNumber, username, password);
            if (response.success) {
                setUser(response.data.user);
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
            await authService.logout();
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        setUser, // Expose setUser for updating user data
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
