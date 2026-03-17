import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import FAQEditor from '../../components/admin/FAQEditor';
import FAQList from '../../components/admin/FAQList';
import Pagination from '../../components/admin/Pagination';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ, toggleFAQStatus, reorderFAQs, getFAQCategories } from '../../services/adminFAQService';

/**
 * FAQManagement - Admin page for managing FAQs
 */
export default function FAQManagement() {
  const [faqs, setFAQs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: 'all',
    active: true,
    search: '',
    sortBy: 'display_order',
    sortOrder: 'ASC',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Load categories and FAQs on mount and when filters change
  useEffect(() => {
    loadCategories();
    fetchFAQs();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const result = await getFAQCategories();
      setCategories(result.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getFAQs(filters);
      setFAQs(result.data || []);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load FAQs');
      setFAQs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingFAQ(null);
    setShowEditor(true);
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq);
    setShowEditor(true);
  };

  const handleSaveFAQ = async (formData) => {
    try {
      setLoading(true);
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, formData);
        setSuccess('FAQ updated successfully');
      } else {
        await createFAQ(formData);
        setSuccess('FAQ created successfully');
      }
      setShowEditor(false);
      setEditingFAQ(null);
      setFilters(prev => ({ ...prev, page: 1 })); // Reset to first page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFAQ = async (id) => {
    try {
      setLoading(true);
      await deleteFAQ(id);
      setSuccess('FAQ deleted successfully');
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFAQ = async (id, isActive) => {
    try {
      await toggleFAQStatus(id, isActive);
      setSuccess(`FAQ ${isActive ? 'activated' : 'deactivated'}`);
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle FAQ status');
    }
  };

  const handleReorder = async (sourceFaqId, targetFaqId) => {
    try {
      // Create new orders array with swapped positions
      const sourceIdx = faqs.findIndex(f => f.id === sourceFaqId);
      const targetIdx = faqs.findIndex(f => f.id === targetFaqId);
      
      if (sourceIdx === -1 || targetIdx === -1) return;

      const orders = faqs.map((faq, idx) => ({
        id: faq.id,
        display_order: idx === sourceIdx 
          ? faqs[targetIdx].display_order 
          : idx === targetIdx 
          ? faqs[sourceIdx].display_order 
          : faq.display_order,
      }));

      await reorderFAQs(orders);
      setSuccess('FAQs reordered successfully');
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reorder FAQs');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
        <p className="text-gray-600 mt-1">Create, edit, and organize frequently asked questions</p>
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

      {/* Editor Panel */}
      {showEditor ? (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-900">
              {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
            </h2>
          </div>
          <FAQEditor
            faq={editingFAQ}
            categories={categories}
            onSave={handleSaveFAQ}
            onCancel={() => {
              setShowEditor(false);
              setEditingFAQ(null);
            }}
            isLoading={loading}
          />
        </>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex gap-4 flex-wrap items-end">
              {/* Search */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.active}
                  onChange={(e) => handleFilterChange({ active: e.target.value === 'true' ? true : e.target.value === 'false' ? false : 'all' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value={'all'}>All</option>
                  <option value={'true'}>Active</option>
                  <option value={'false'}>Inactive</option>
                </select>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
                New FAQ
              </button>
            </div>
          </div>

          {/* FAQs List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600">Loading FAQs...</div>
            </div>
          ) : faqs.length > 0 ? (
            <FAQList
              faqs={faqs}
              onEdit={handleEditFAQ}
              onDelete={handleDeleteFAQ}
              onToggle={handleToggleFAQ}
              onReorder={handleReorder}
              isLoading={loading}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No FAQs found. Create one to get started!</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
