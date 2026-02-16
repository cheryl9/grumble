import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Registration from './pages/auth/Registration';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import OnboardingSurvey from './pages/auth/OnboardingSurvey';
import Explore from './pages/Explore';
import FindSpots from './pages/FindSpots';
import FoodMap from './pages/FoodMap';
import Chats from './pages/Chats';
import Profile from './pages/Profile';

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
  }
]);