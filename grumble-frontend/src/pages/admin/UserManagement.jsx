import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, UserPlus, Download } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as adminUserService from '../../services/adminUserService';
import UserTable from '../../components/admin/UserTable';
import UserDetailModal from '../../components/admin/UserDetailModal';
import FreezeUserModal from '../../components/admin/FreezeUserModal';
import Pagination from '../../components/admin/Pagination';

/**
 * UserManagement Page
 * Admin page for managing users with search, filters, and actions
 */
export default function UserManagement() {
  const { admin } = useAdminAuth();
  const isSuperadmin = admin?.role === 'superadmin';

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Success messages
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, statusFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: statusFilter,
        sortBy,
        sortOrder
      };

      const result = await adminUserService.getUsers(filters);
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleFreeze = (user) => {
    setSelectedUser(user);
    setShowFreezeModal(true);
  };

  const handleUnfreeze = async (user) => {
    if (window.confirm(`Are you sure you want to unfreeze @${user.username}?`)) {
      try {
        await adminUserService.unfreezeUser(user.id);
        setSuccessMessage(`Successfully unfrozen @${user.username}`);
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to unfreeze user');
      }
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmFreeze = async (reason) => {
    try {
      await adminUserService.freezeUser(selectedUser.id, reason);
      setSuccessMessage(`Successfully frozen @${selectedUser.username}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowFreezeModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      throw err;
    }
  };

  const confirmDelete = async () => {
    try {
      const reason = prompt('Enter reason for deletion (optional):');
      await adminUserService.deleteUser(selectedUser.id, reason || '');
      setSuccessMessage(`Successfully deleted @${selectedUser.username}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage and monitor user accounts</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by username or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="created_at">Joined Date</option>
              <option value="updated_at">Last Updated</option>
              <option value="last_active_at">Last Active</option>
              <option value="username">Username</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Filter size={18} />
              {sortOrder === 'ASC' ? '↑' : '↓'}
            </button>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {users.length} of {pagination.total} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Export feature coming soon')}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <UserTable
              users={users}
              onViewDetails={handleViewDetails}
              onFreeze={handleFreeze}
              onUnfreeze={handleUnfreeze}
              onDelete={handleDelete}
              isSuperadmin={isSuperadmin}
            />
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          userId={selectedUser.id}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
          onFreeze={(user) => {
            setShowDetailModal(false);
            handleFreeze(user);
          }}
          onUnfreeze={(user) => {
            setShowDetailModal(false);
            handleUnfreeze(user);
          }}
          onDelete={(user) => {
            setShowDetailModal(false);
            handleDelete(user);
          }}
          isSuperadmin={isSuperadmin}
        />
      )}

      {/* Freeze User Modal */}
      {showFreezeModal && selectedUser && (
        <FreezeUserModal
          user={selectedUser}
          onClose={() => {
            setShowFreezeModal(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmFreeze}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setShowDeleteConfirm(false)}
            ></div>
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete User Account
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>@{selectedUser.username}</strong>? 
                This action will soft-delete the account and can only be performed by superadmins.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
