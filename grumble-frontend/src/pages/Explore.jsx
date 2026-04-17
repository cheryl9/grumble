import React, { useState, useEffect } from "react";
import api from "../services/api";
import FoodPostCard from "../components/explorePage/FoodPostCard";
import PostDetailModal from "../components/explorePage/PostDetailModal";
import CreatePostModal from "../components/explorePage/CreatePostModal";
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
    // Optimistic update in the feed list
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nowSaved = !p.saved_by_me;
        return {
          ...p,
          saved_by_me: nowSaved,
          saves_count: nowSaved
            ? p.saves_count + 1
            : Math.max(p.saves_count - 1, 0),
        };
      }),
    );

    // If the post detail modal is open for this post, update it too
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => {
        if (!prev) return prev;
        const nowSaved = !prev.saved_by_me;
        return {
          ...prev,
          saved_by_me: nowSaved,
          saves_count: nowSaved
            ? prev.saves_count + 1
            : Math.max(prev.saves_count - 1, 0),
        };
      });
    }

    try {
      await api.post(`/posts/${postId}/save`);
    } catch (err) {
      console.error("Save failed, reverting:", err);
      // Revert feed list
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const revert = !p.saved_by_me;
          return {
            ...p,
            saved_by_me: revert,
            saves_count: revert
              ? p.saves_count + 1
              : Math.max(p.saves_count - 1, 0),
          };
        }),
      );
      // Revert modal
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => {
          if (!prev) return prev;
          const revert = !prev.saved_by_me;
          return {
            ...prev,
            saved_by_me: revert,
            saves_count: revert
              ? prev.saves_count + 1
              : Math.max(prev.saves_count - 1, 0),
          };
        });
      }
    }
  };
  // ────────────────────────────────────────────────────────────

  const handleOpenPost = async (post) => {
    try {
      const res = await api.get(`/posts/${post.id}`);
      setSelectedPost(res.data);
    } catch (err) {
      console.error("Failed to fetch post detail:", err);
      setSelectedPost(post);
    }
  };

  const handleCommentAdded = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
      ),
    );
  };

  return (
    <div className="explore-page">
      {/* Header */}
      <div className="explore-header">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Grumble" className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Explore</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="explore-tabs"
        style={{ display: "flex", borderBottom: "1.5px solid #e5e5e5" }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 500,
              background: "none",
              border: "none",
              borderBottom:
                activeTab === key
                  ? "2.5px solid #FF6B35"
                  : "2.5px solid transparent",
              color: activeTab === key ? "#FF6B35" : "#888",
              marginBottom: "-1.5px",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Upload button */}
      <div className="flex justify-end px-4 mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary px-4 py-2 rounded-xl text-sm"
        >
          + Upload New
        </button>
      </div>

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

      {!isLoading && !error && posts.length > 0 && (
        <div className="posts-grid">
          {posts.map((post) => (
            <FoodPostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onSave={() => handleSave(post.id)} // ← pass it down
              onClick={() => handleOpenPost(post)}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => handleLike(selectedPost.id)}
          onSave={() => handleSave(selectedPost.id)} // ← pass it down
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
    </div>
  );
};

export default Explore;
