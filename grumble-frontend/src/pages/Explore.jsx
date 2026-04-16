import React, { useState, useEffect } from "react";
import api from "../services/api";
import FoodPostCard from "../components/explorePage/FoodPostCard";
import PostDetailModal from "../components/explorePage/PostDetailModal";
import CreatePostModal from "../components/explorePage/CreatePostModal";
import ReportPostModal from "../components/explorePage/ReportPostModal";
import EditPostModal from "../components/explorePage/EditPostModal";
import logo from "../assets/logo.png";

const TABS = [
  { key: "foryou", label: "For You" },
  { key: "friends", label: "Friends" },
  { key: "mine", label: "My posts" },
];

const Explore = () => {
  const [activeTab, setActiveTab] = useState("foryou");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportingPostId, setReportingPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/posts", { params: { tab: activeTab } });
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch feed:", err);
        setError("Could not load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, [activeTab]);

  const handleLike = async (postId) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nowLiked = !p.liked_by_me;
        return {
          ...p,
          liked_by_me: nowLiked,
          likes_count: nowLiked
            ? p.likes_count + 1
            : Math.max(p.likes_count - 1, 0),
        };
      }),
    );

    try {
      await api.post(`/posts/${postId}/like`);
    } catch (err) {
      console.error("Like failed, reverting:", err);
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const revert = !p.liked_by_me;
          return {
            ...p,
            liked_by_me: revert,
            likes_count: revert
              ? p.likes_count + 1
              : Math.max(p.likes_count - 1, 0),
          };
        }),
      );
    }
  };

  const handleSave = async (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nowSaved = !p.saved_by_me;
        return {
          ...p,
          saved_by_me: nowSaved,
          saves_count: nowSaved
            ? p.saves_count + 1
            : Math.max((p.saves_count || 0) - 1, 0),
        };
      }),
    );

    try {
      const res = await api.post(`/posts/${postId}/save`);
      const savedByMe =
        res?.data?.saved_by_me !== undefined
          ? res.data.saved_by_me
          : Boolean(res?.data?.saved);

      // Reconcile optimistic state with backend truth.
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          if (p.saved_by_me === savedByMe) return p;

          return {
            ...p,
            saved_by_me: savedByMe,
            saves_count: savedByMe
              ? (p.saves_count || 0) + 1
              : Math.max((p.saves_count || 0) - 1, 0),
          };
        }),
      );
    } catch (err) {
      console.error("Save failed, reverting:", err);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const revertSaved = !p.saved_by_me;
          return {
            ...p,
            saved_by_me: revertSaved,
            saves_count: revertSaved
              ? p.saves_count + 1
              : Math.max((p.saves_count || 0) - 1, 0),
          };
        }),
      );
    }
  };

  // Open post detail modal — fetches full post + comments
  const handleOpenPost = async (post) => {
    try {
      const res = await api.get(`/posts/${post.id}`);
      setSelectedPost(res.data);
    } catch (err) {
      console.error("Failed to fetch post detail:", err);
      // Fall back to showing whatever data we already have
      setSelectedPost(post);
    }
  };

  // After adding a comment, update the comment count in the list
  const handleCommentAdded = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
      ),
    );
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm("Delete this post? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
    } catch (err) {
      const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
      alert(backendMessage || "Failed to delete post.");
    }
  };

  const handleEditPost = async (payload) => {
    if (!editingPost) return;

    try {
      setIsEditing(true);
      const res = await api.patch(`/posts/${editingPost.id}`, payload);
      const updatedPost = res.data;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === updatedPost.id
            ? {
                ...p,
                location_name: updatedPost.location_name,
                description: updatedPost.description,
                rating: updatedPost.rating,
                visibility: updatedPost.visibility,
                image_url: updatedPost.image_url,
              }
            : p,
        ),
      );

      if (selectedPost?.id === updatedPost.id) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                location_name: updatedPost.location_name,
                description: updatedPost.description,
                rating: updatedPost.rating,
                visibility: updatedPost.visibility,
                image_url: updatedPost.image_url,
              }
            : prev,
        );
      }

      setEditingPost(null);
    } catch (err) {
      const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
      alert(backendMessage || "Failed to edit post.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="explore-page">
      {/* Header */}
      <div className="explore-header">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Grumble" className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold">Explore</h1>
            <p className="explore-subtitle">Discover what the community is eating today</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="explore-tabs-shell">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`explore-tab-btn ${activeTab === key ? "explore-tab-active" : "explore-tab-inactive"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Upload button */}
      <div className="explore-toolbar">
        <button
          onClick={() => setShowCreate(true)}
          className="explore-upload-btn"
        >
          + Upload New
        </button>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <p className="text-gray-400">Loading posts...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="flex justify-center py-12">
          <p className="text-gray-400">
            {activeTab === "mine"
              ? "You haven't posted yet."
              : activeTab === "friends"
                ? "No posts from friends yet."
                : "No posts yet. Be the first!"}
          </p>
        </div>
      )}

      {/* Post grid */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="posts-grid">
          {posts.map((post) => (
            <FoodPostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onSave={() => handleSave(post.id)}
              onReport={() => setReportingPostId(post.id)}
              onEdit={() => setEditingPost(post)}
              onDelete={() => handleDeletePost(post.id)}
              canManage={activeTab === "mine"}
              onClick={() => handleOpenPost(post)}
            />
          ))}
        </div>
      )}

      {/* Post detail modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => handleLike(selectedPost.id)}
          onCommentAdded={() => handleCommentAdded(selectedPost.id)}
        />
      )}

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onPostCreated={() => {
            setShowCreate(false);
            setActiveTab("mine");
          }}
        />
      )}

      {reportingPostId && (
        <ReportPostModal
          postId={reportingPostId}
          onClose={() => setReportingPostId(null)}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleEditPost}
          isSaving={isEditing}
        />
      )}
    </div>
  );
};

export default Explore;
