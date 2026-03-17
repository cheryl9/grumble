import React, { useState, useEffect } from 'react';
import { Lock, User, LogOut } from 'lucide-react';
import { getCurrentAdmin, changeAdminPassword } from '../../services/adminFAQService';
import { useNavigate } from 'react-router-dom';

/**
 * Settings - Admin settings and profile management
 */
export default function Settings() {
  const navigate = useNavigate();
  
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const result = await getCurrentAdmin();
      setAdmin(result.data);
    } catch (err) {
      setError('Failed to load admin profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!passwordForm.currentPassword) {
      setError('Current password is required');
      return;
    }
    if (!passwordForm.newPassword) {
      setError('New password is required');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      await changeAdminPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setSuccess('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading && !admin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your admin account settings</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Profile Card */}
      {admin && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {admin.full_name || 'Admin User'}
              </h2>
              <p className="text-gray-600">@{admin.username}</p>
              <p className="text-sm text-gray-500 mt-1">
                {admin.role === 'superadmin' ? '🔐 Superadmin' : '👤 Admin'}
              </p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{admin.email}</p>
            </div>
            {admin.full_name && (
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">{admin.full_name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Last Login</p>
              <p className="font-medium text-gray-900">
                {admin.last_login_at 
                  ? new Date(admin.last_login_at).toLocaleString() 
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="font-medium">
                {admin.is_active ? (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                    Active
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                    Inactive
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Security</h3>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm ? (
          <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 8 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters, mix of uppercase, lowercase, and numbers recommended
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">
            Keep your password secure. You should change it regularly.
          </p>
        )}
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogOut className="text-red-600" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">Logout</h3>
              <p className="text-sm text-gray-600">End your current session</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
