import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected route wrapper component
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    // 🚧 DEV MODE: Bypass authentication (set to false in production!)
    const DEV_MODE = true;
    if (DEV_MODE) {
        return children;
    }

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render children if authenticated
    return children;
}
