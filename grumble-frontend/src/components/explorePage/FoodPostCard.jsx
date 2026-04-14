import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MapPin, User } from 'lucide-react';

const FoodPostCard = ({ post, onLike, onClick }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    onLike?.();
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div className="post-card" onClick={onClick}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <span className="font-medium text-sm">{post.username}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={16} className="text-red-500" />
          {/* location_name instead of location */}
          <span className="text-xs font-medium">{post.location_name}</span>
        </div>
      </div>

      <div className="post-image">
        {/* image_url instead of image */}
        <img
          src={post.image_url}
          alt={post.description}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="post-interaction">
              <Heart
                size={20}
                className={post.liked_by_me ? 'fill-red-500 text-red-500' : 'text-gray-700'}
              />
              {/* likes_count instead of likes */}
              <span className="text-sm font-medium">{post.likes_count}</span>
            </button>

            <button className="post-interaction">
              <MessageCircle size={20} className="text-gray-700" />
              {/* comments_count instead of comments */}
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>

            <button className="icon-btn">
              <Send size={20} className="text-gray-700" />
            </button>
          </div>

          <button onClick={handleSave} className="icon-btn">
            <Bookmark
              size={20}
              className={isSaved ? 'fill-gray-700 text-gray-700' : 'text-gray-700'}
            />
          </button>
        </div>

        <div className="post-caption">
          <p className="text-sm line-clamp-2">
            <span className="font-semibold">{post.username}</span>{' '}
            {/* description instead of caption */}
            {post.description}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FoodPostCard;