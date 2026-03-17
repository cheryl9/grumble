import { Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PostCard({ post, onView, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {post.image_url ? (
        <img
          src={post.image_url}
          alt={post.location_name}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{post.location_name}</h3>
            <p className="text-xs text-gray-500">by @{post.username}</p>
          </div>
          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
            {post.visibility}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.description || 'No description'}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <span>⭐ {post.rating || 'N/A'}</span>
          <span>❤️ {post.likes_count || 0}</span>
          <span>💬 {post.comments_count || 0}</span>
          <span>⚠️ {post.report_count || 0}</span>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy HH:mm') : 'Unknown'}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onView(post)}
            className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View
          </button>
          <button
            onClick={() => onDelete(post)}
            className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
