import React, { useEffect, useState } from "react";
import { X, MapPin, MessageCircle } from "lucide-react";
import api from "../../services/api";
import UserAvatar from "../common/UserAvatar";

const PostDetailModal = ({ post, onClose, onCommentAdded }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    setComments(post.comments || []);
  }, [post]);

  // Debug: Log hashtags to see what we're getting
  useEffect(() => {
    console.log("Post object:", post);
    console.log("Post hashtags:", post.hashtags);
  }, [post]);

  const handlePostComment = async () => {
    const content = commentText.trim();
    if (!content || isPostingComment) return;

    try {
      setIsPostingComment(true);
      const response = await api.post(`/posts/${post.id}/comments`, {
        content,
      });
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const createdComment = response.data;

      const commentWithUsername = {
        ...createdComment,
        username: createdComment.username || currentUser.username || "You",
      };

      setComments((prev) => [...prev, commentWithUsername]);
      onCommentAdded?.();
      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-grey bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-5xl overflow-hidden flex shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ height: "80vh", maxHeight: "700px" }}
      >
        {/* Image */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center">
          <img
            src={post.image_url}
            alt={post.description}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Details & Comments */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <UserAvatar equippedAvatar={post.equipped_avatar} size={48} />
              <div>
                <h3 className="font-semibold text-lg">{post.username}</h3>
                {post.location_name && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} className="text-red-500" />
                    <span>{post.location_name}</span>
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
            <div className="flex gap-3 mb-2">
              <UserAvatar equippedAvatar={post.equipped_avatar} size={32} />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{post.username}</span>{" "}
                  {post.description}
                </p>
              </div>
            </div>
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {post.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Comments Header */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 bg-orange-100">
            <MessageCircle size={20} className="text-gray-700" />
            <h4 className="font-semibold text-lg">Comments</h4>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <UserAvatar
                      equippedAvatar={comment.equipped_avatar}
                      size={40}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm mb-1">
                        {comment.username}
                      </h5>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {comment.content}
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
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
              <button
                onClick={handlePostComment}
                disabled={isPostingComment || !commentText.trim()}
                className="px-8 py-3 bg-coral text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPostingComment ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
