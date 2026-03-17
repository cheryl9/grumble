import { User, Eye, Lock, Unlock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

/**
 * UserTable Component
 * Displays users in a table with actions
 * 
 * @param {Array} users - Array of user objects
 * @param {function} onViewDetails - Callback when viewing user details
 * @param {function} onFreeze - Callback when freezing user
 * @param {function} onUnfreeze - Callback when unfreezing user
 * @param {function} onDelete - Callback when deleting user
 * @param {boolean} isSuperadmin - Whether current admin is superadmin
 */
export default function UserTable({ 
  users, 
  onViewDetails, 
  onFreeze, 
  onUnfreeze, 
  onDelete,
  isSuperadmin = false 
}) {

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      frozen: 'bg-orange-100 text-orange-800',
      deleted: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || badges.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User
          </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stats
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telegram
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                {/* User */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </div>
                  </div>
                </td>

                {/* Phone */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.phone_number}</div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.account_status)}
                  {user.frozen_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Since {formatDate(user.frozen_at)}
                    </div>
                  )}
                </td>

                {/* Stats */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.post_count} posts
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.friend_count} friends • {user.current_streak} streak
                  </div>
                </td>

                {/* Telegram */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.telegram_chat_id ? (
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {user.telegram_username ? `@${user.telegram_username}` : user.telegram_first_name}
                      </div>
                      <div className="text-xs text-green-600">Connected</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not connected</span>
                  )}
                </td>

                {/* Joined */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* View Details */}
                    <button
                      onClick={() => onViewDetails(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Freeze/Unfreeze */}
                    {user.account_status === 'active' ? (
                      <button
                        onClick={() => onFreeze(user)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Freeze Account"
                      >
                        <Lock size={18} />
                      </button>
                    ) : user.account_status === 'frozen' ? (
                      <button
                        onClick={() => onUnfreeze(user)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Unfreeze Account"
                      >
                        <Unlock size={18} />
                      </button>
                    ) : null}

                    {/* Delete (Superadmin only) */}
                    {isSuperadmin && user.account_status !== 'deleted' && (
                      <button
                        onClick={() => onDelete(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
  );
}
