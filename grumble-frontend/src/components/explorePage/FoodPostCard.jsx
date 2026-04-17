import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MapPin, User, Flag, Pencil, Trash2 } from 'lucide-react';

const FoodPostCard = ({ post, onLike, onSave, onReport, onEdit, onDelete, canManage = false, onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    onLike?.();
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave?.();
  };

  const handleShare = async (e) => {
    e.stopPropagation();

    try {
      const shareLink = `http://localhost:5173/explore?post=${post.id}`;
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleReport = (e) => {
    e.stopPropagation();
    onReport?.();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div className="post-card post-card-pro" onClick={onClick}>
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#FCF1DD] rounded-full flex items-center justify-center border border-[#F4DAB8]">
            <User size={16} className="text-gray-600" />
          </div>
          <span className="font-medium text-sm">{post.username}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={16} className="text-red-500" />
          {/* location_name instead of location */}
          <span className="text-xs font-medium line-clamp-1">{post.location_name || 'Location unavailable'}</span>
        </div>
      </div>

      <div className="post-image">
        {/* image_url instead of image */}
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.description}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
            No image available
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={handleLike} className="post-interaction">
              <Heart
                size={20}
                className={
                  post.liked_by_me
                    ? "fill-red-500 text-red-500"
                    : "text-gray-700"
                }
              />
              {/* likes_count instead of likes */}
              <span className="text-sm font-medium">{post.likes_count}</span>
            </button>

            <button className="post-interaction">
              <MessageCircle size={20} className="text-gray-700" />
              {/* comments_count instead of comments */}
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>

            <button onClick={handleShare} className="icon-btn relative post-action-icon">
              <Send size={20} className="text-gray-700" />
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            <button onClick={handleReport} className="icon-btn post-action-icon" title="Report post">
              <Flag size={20} className="text-gray-700" />
            </button>
          </div>

          <button onClick={handleSave} className="icon-btn post-action-icon">
            <Bookmark
              size={20}
              className={post.saved_by_me ? 'fill-gray-700 text-gray-700' : 'text-gray-700'}
            />
          </button>
        </div>

        <div className="post-caption pt-1">
          <p className="text-sm line-clamp-2 text-gray-700">
            <span className="font-semibold">{post.username}</span>{' '}
            {/* description instead of caption */}
            {post.description || 'No caption provided.'}
          </p>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleDateString()}
          </p>

          {canManage && (
            <div className="flex items-center gap-4 mt-3">
              <button onClick={handleEdit} className="text-xs text-[#2945A8] flex items-center gap-1 hover:underline">
                <Pencil size={14} />
                Edit
              </button>
              <button onClick={handleDelete} className="text-xs text-red-500 flex items-center gap-1 hover:underline">
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodPostCard;
