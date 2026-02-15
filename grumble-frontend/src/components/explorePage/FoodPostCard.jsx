import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MapPin, User } from 'lucide-react';
import PostDetailModal from './PostDetailModal';

const FoodPostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showDetail, setShowDetail] = useState(false);

  const handleLike = (error) => {
    error.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleSave = (error) => {
    error.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div className="post-card" onClick = {() => setShowDetail(true)}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <span className="font-medium text-sm">{post.username}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={16} className="text-red-500" />
          <span className="text-xs font-medium">{post.location}</span>
        </div>
      </div>

      <div className = "post-image">
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button onClick={handleLike} className="post-interaction">
              <Heart 
                size={20} 
                className={`${isLiked ? 'fill-red-500 text-red-500 pulse-once' : 'text-gray-700'}`}
              />
              <span className="text-sm font-medium">{likes}</span>
            </button>

            {/* Comment Button */}
            <button className="post-interaction">
              <MessageCircle size={20} className="text-gray-700" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>

            {/* Share Button */}
            <button className="icon-btn">
              <Send size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} className="icon-btn">
            <Bookmark 
              size={20} 
              className={`${isSaved ? 'fill-gray-700 text-gray-700' : 'text-gray-700'}`}
            />
          </button>
        </div>

        {/* Caption Button */}
        <div className="post-caption">
          <p className="text-sm line-clamp-2">
            <span className="font-semibold">{post.username}</span> {post.caption}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="text-blue-600 text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">{post.timeAgo}</p>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <PostDetailModal 
          post={post} 
          onClose={() => setShowDetail(false)} 
        />
      )}
    </div>
  );
};

export default FoodPostCard;