import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import Registration from './pages/auth/Registration';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import OnboardingSurvey from './pages/auth/OnboardingSurvey';
import Explore from './pages/Explore';
import FindSpots from './pages/FindSpots';
import FoodMap from './pages/FoodMap';
import Chats from './pages/Chats';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import PostManagement from './pages/admin/PostManagement';
import ReportReview from './pages/admin/ReportReview';
import FAQManagement from './pages/admin/FAQManagement';
import ActivityLogs from './pages/admin/ActivityLogs';
import Settings from './pages/admin/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Registration />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute><OnboardingSurvey /></ProtectedRoute>
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Explore /> },
      { path: 'explore', element: <Explore /> },
      { path: 'find-spots', element: <FindSpots /> },
      { path: 'food-map', element: <FoodMap /> },
      { path: 'chats', element: <Chats /> },
      { path: 'profile', element: <Profile /> }
    ]
  },
  // Admin routes
  {
    path: '/admin/login',
    element: <AdminLogin />
  },
  {
    path: '/admin',
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'posts', element: <PostManagement /> },
      { path: 'reports', element: <ReportReview /> },
      { path: 'faqs', element: <FAQManagement /> },
      { path: 'logs', element: <ActivityLogs /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
]);