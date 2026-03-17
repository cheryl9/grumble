import React, { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import ActivityLogTable from '../../components/admin/ActivityLogTable';
import Pagination from '../../components/admin/Pagination';
import { getAdminLogs, getAllAdmins } from '../../services/adminFAQService';

/**
 * ActivityLogs - Admin page for viewing admin activity audit logs
 */
export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    adminId: '',
    action: '',
    targetType: '',
    fromDate: '',
    toDate: '',
    sortOrder: 'DESC',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  // Load admins list on mount
  useEffect(() => {
    loadAdmins();
  }, []);

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const loadAdmins = async () => {
    try {
      const result = await getAllAdmins();
      setAdmins(result.data?.admins || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAdminLogs(filters);
      setLogs(result.data?.logs || []);
      setPagination(result.data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load activity logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }

    const headers = ['ID', 'Admin', 'Action', 'Target Type', 'Target ID', 'IP Address', 'Timestamp'];
    const data = logs.map(log => [
      log.id,
      log.admin?.username || 'Unknown',
      log.action,
      log.target_type || '-',
      log.target_id || '-',
      log.ip_address || '-',
      new Date(log.created_at).toISOString(),
    ]);

    const csv = [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const actionTypes = [
    'user_created',
    'user_deleted',
    'user_frozen',
    'user_unfrozen',
    'post_deleted',
    'comment_deleted',
    'report_reviewed',
    'report_resolved',
    'report_dismissed',
    'faq_created',
    'faq_updated',
    'faq_deleted',
    'faq_toggled',
    'faq_reordered',
  ];

  const targetTypes = ['user', 'post', 'comment', 'report', 'faq'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">View all admin actions and changes</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Admin Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin
            </label>
            <select
              value={filters.adminId}
              onChange={(e) => handleFilterChange({ adminId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Admins</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name || admin.username}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange({ action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Target Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Type
            </label>
            <select
              value={filters.targetType}
              onChange={(e) => handleFilterChange({ targetType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Types</option>
              {targetTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="datetime-local"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange({ fromDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="datetime-local"
              value={filters.toDate}
              onChange={(e) => handleFilterChange({ toDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600 pt-2 border-t">
          {pagination.total > 0 ? (
            <>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </>
          ) : (
            <>No results found</>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <ActivityLogTable logs={logs} isLoading={loading} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
