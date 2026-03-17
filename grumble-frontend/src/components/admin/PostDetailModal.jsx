import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getPostDetails } from '../../services/adminPostService';

export default function PostDetailModal({ postId, onClose, onDeletePost, onDeleteComment }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getPostDetails(postId);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [postId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Close</button>
        </div>
      </div>
    );
  }

  const { post, comments, reports } = data;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Post Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {post.image_url ? (
                <img src={post.image_url} alt={post.location_name} className="w-full h-72 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No image</div>
              )}

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><strong>Location:</strong> {post.location_name}</p>
                <p><strong>User:</strong> @{post.username}</p>
                <p><strong>Visibility:</strong> {post.visibility}</p>
                <p><strong>Rating:</strong> {post.rating || 'N/A'}</p>
                <p><strong>Created:</strong> {format(new Date(post.created_at), 'MMM d, yyyy HH:mm')}</p>
              </div>

              <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">{post.description || 'No description'}</p>

              <button
                onClick={() => onDeletePost(post)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Post
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Comments ({comments.length})</h3>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-md p-3">
                      <p className="text-xs text-gray-500 mb-1">@{comment.username}</p>
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      <button
                        onClick={async () => {
                          await onDeleteComment(comment);
                          await loadDetails();
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete comment
                      </button>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-sm text-gray-500">No comments</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Reports ({reports.length})</h3>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-md p-3">
                      <p className="text-xs text-gray-500">#{report.id} • {report.status}</p>
                      <p className="text-sm font-medium text-gray-800">{report.reason}</p>
                      <p className="text-sm text-gray-600">{report.description || 'No details'}</p>
                    </div>
                  ))}
                  {reports.length === 0 && <p className="text-sm text-gray-500">No reports for this post</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
