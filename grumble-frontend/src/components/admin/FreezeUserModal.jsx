import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * FreezeUserModal Component
 * Modal for freezing a user account with reason
 * 
 * @param {Object} user - User object to freeze
 * @param {function} onClose - Callback to close modal
 * @param {function} onConfirm - Callback when freeze is confirmed (receives reason)
 */
export default function FreezeUserModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('permanent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate reason
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      // Add duration to reason if not permanent
      let fullReason = reason.trim();
      if (duration !== 'permanent') {
        fullReason += ` (Duration: ${duration})`;
      }
      
      await onConfirm(fullReason);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to freeze account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg text-left shadow-xl transform transition-all w-full max-w-lg z-10">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Freeze User Account
                    </h3>
                    <p className="text-sm text-gray-600">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Freezing this account will prevent the user from logging in and accessing the platform. 
                  You must provide a reason for this action.
                </p>
              </div>

              {/* Duration Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="7days">7 days</option>
                  <option value="30days">30 days</option>
                  <option value="permanent">Permanent (until unfrozen)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {duration === 'permanent' 
                    ? 'Account will remain frozen until manually unfrozen by an admin'
                    : `Account will be automatically unfrozen after ${duration.replace('days', ' days')}`}
                </p>
              </div>

              {/* Reason Textarea */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this account is being frozen..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 10 characters. This will be logged and visible to other admins.
                </p>
              </div>

              {/* Warning */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action will be logged in the admin activity log.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim() || reason.trim().length < 10}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Freezing...' : 'Freeze Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
