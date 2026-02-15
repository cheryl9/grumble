import React from 'react';
import { X, MapPin, User, MessageCircle } from 'lucide-react';

const PostDetailModal = ({ post, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-grey bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-5xl overflow-hidden flex shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '80vh', maxHeight: '700px' }}
      >
        {/* Image */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center">
          <img 
            src={post.image} 
            alt={post.caption}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Details & Comments */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{post.username}</h3>
                {post.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} className="text-red-500" />
                    <span>{post.location}</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white bg-red-500 hover:bg-red-600 rounded-full p-1 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Caption Section */}
          <div className="p-4 border-b">
            <p className="text-sm mb-2">
              <span className="font-semibold">{post.username}</span> {post.caption}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-blue-600 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">{post.timeAgo}</p>
          </div>

          {/* Comments Header */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 bg-orange-100">
            <MessageCircle size={20} className="text-gray-700" />
            <h4 className="font-semibold text-lg">Comments</h4>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm mb-1">{comment.user}</h5>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">No comments yet</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
              <button className="px-8 py-3 bg-coral text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;