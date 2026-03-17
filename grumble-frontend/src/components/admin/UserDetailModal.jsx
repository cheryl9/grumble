import { useState, useEffect } from 'react';
import { X, User, Lock, Unlock, Trash2, Phone, Calendar, Zap, Users, FileText, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { getUserDetails } from '../../services/adminUserService';

/**
 * UserDetailModal Component
 * Shows full user details with stats, posts, and friends
 * 
 * @param {number} userId - User ID to display
 * @param {function} onClose - Callback to close modal
 * @param {function} onFreeze - Callback when freeze button clicked
 * @param {function} onUnfreeze - Callback when unfreeze button clicked
 * @param {function} onDelete - Callback when delete button clicked
 * @param {boolean} isSuperadmin - Whether current admin is superadmin
 */
export default function UserDetailModal({ 
  userId, 
  onClose, 
  onFreeze, 
  onUnfreeze, 
  onDelete,
  isSuperadmin = false 
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getUserDetails(userId);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800' },
      frozen: { bg: 'bg-orange-100', text: 'text-orange-800' },
      deleted: { bg: 'bg-red-100', text: 'text-red-800' },
      suspended: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const badge = badges[status] || badges.active;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
          <div className="relative bg-white rounded-lg p-8 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading user details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
          <div className="relative bg-white rounded-lg p-8 max-w-md z-10">
            <p className="text-red-600">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, stats, recentPosts, friends } = data;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg text-left shadow-xl transform transition-all w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-orange-100 text-sm">User ID: {user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(user.account_status)}
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span>{user.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>
                  {user.telegram_chat_id && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md">
                      <p className="text-xs text-gray-600 mb-1">Telegram Connected</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.telegram_username ? `@${user.telegram_username}` : user.telegram_first_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Since {formatDate(user.telegram_connected_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-gray-900">{user.account_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium text-gray-900">{formatDate(user.updated_at)}</span>
                  </div>
                  {user.frozen_at && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-xs text-gray-600 mb-1">Frozen Since</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(user.frozen_at)}</p>
                      {user.frozen_reason && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Reason:</strong> {user.frozen_reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={20} className="text-blue-600" />
                    <span className="text-sm text-gray-600">Posts</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.posts_count || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={20} className="text-purple-600" />
                    <span className="text-sm text-gray-600">Friends</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.friends_count || 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={20} className="text-orange-600" />
                    <span className="text-sm text-gray-600">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.current_streak || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={20} className="text-green-600" />
                    <span className="text-sm text-gray-600">Likes Given</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.likes_given || 0}</p>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Posts</h3>
              {recentPosts.length === 0 ? (
                <p className="text-gray-500 text-sm">No posts yet</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-colors">
                      <div className="flex gap-3">
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt={post.location_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{post.location_name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>⭐ {post.rating}/5</span>
                            <span>❤️ {post.likes_count}</span>
                            <span>💬 {post.comments_count}</span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Friends */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Friends ({friends.length})</h3>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-sm">No friends yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {friends.map((friend) => (
                    <div key={friend.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{friend.username}</p>
                      <p className="text-xs text-gray-500">{friend.phone_number}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Friends since {formatDate(friend.friends_since)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            {user.account_status === 'active' && (
              <button
                onClick={() => onFreeze(user)}
                className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 flex items-center gap-2"
              >
                <Lock size={16} />
                Freeze Account
              </button>
            )}

            {user.account_status === 'frozen' && (
              <button
                onClick={() => onUnfreeze(user)}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 flex items-center gap-2"
              >
                <Unlock size={16} />
                Unfreeze Account
              </button>
            )}

            {isSuperadmin && user.account_status !== 'deleted' && (
              <button
                onClick={() => onDelete(user)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete User
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
