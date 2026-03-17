import { useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import PostCard from '../../components/admin/PostCard';
import PostDetailModal from '../../components/admin/PostDetailModal';
import Pagination from '../../components/admin/Pagination';
import * as adminPostService from '../../services/adminPostService';

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminPostService.getPosts({
        page: pagination.page,
        limit: pagination.limit,
        visibility,
        search,
        fromDate,
        toDate,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });

      setPosts(result.posts);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, visibility]);

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Delete post at ${post.location_name}?`)) return;

    try {
      const reason = window.prompt('Reason for deleting this post (optional):', '') || '';
      await adminPostService.deletePost(post.id, reason);
      fetchPosts();
      setSelectedPost(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const reason = window.prompt('Reason for deleting this comment (optional):', '') || '';
      await adminPostService.deleteComment(comment.id, reason);
      setSelectedPost((prev) => (prev ? { ...prev } : prev));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post Management</h1>
        <p className="text-gray-600 mt-1">Moderate user-generated posts and comments</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location, description, or user"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="md:col-span-2">
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="all">All visibility</option>
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        <div className="md:col-span-2">
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button
            onClick={() => {
              setPagination((p) => ({ ...p, page: 1 }));
              fetchPosts();
            }}
            className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-md"
          >
            Apply
          </button>
          <button onClick={fetchPosts} className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-10 w-10 rounded-full border-b-2 border-orange-600 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onView={setSelectedPost} onDelete={handleDeletePost} />
            ))}
            {posts.length === 0 && <p className="text-gray-500">No posts found</p>}
          </div>

          <div className="mt-4 bg-white border border-gray-200 rounded-lg">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => setPagination((p) => ({ ...p, page }))} />
          </div>
        </>
      )}

      {selectedPost && (
        <PostDetailModal
          postId={selectedPost.id}
          onClose={() => setSelectedPost(null)}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
}
