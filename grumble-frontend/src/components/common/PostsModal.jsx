import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Bookmark, Star } from "lucide-react";
import api from "../../services/api";
import defaultPng from "../../assets/avatars/default.png";

export default function PostsModal({ type, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const titles = {
    posts: "My Posts",
    liked: "Liked Posts",
    saved: "Saved Posts",
  };

  useEffect(() => {
    fetchPosts();
  }, [type]);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      let endpoint;
      if (type === "posts") {
        endpoint = "/posts?tab=mine";
      } else if (type === "liked") {
        endpoint = "/posts/liked";
      } else {
        endpoint = "/posts/saved";
      }

      const response = await api.get(endpoint);
      // Handle both { data: [...] } and plain array responses
      const raw = response.data;
      setPosts(Array.isArray(raw) ? raw : raw.data ?? []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (postId) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked_by_me: !p.liked_by_me,
              likes_count: p.liked_by_me
                ? Math.max(0, p.likes_count - 1)
                : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      await api.post(`/posts/${postId}/like`);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked_by_me: !p.liked_by_me,
                likes_count: p.liked_by_me
                  ? Math.max(0, p.likes_count - 1)
                  : p.likes_count + 1,
              }
            : p
        )
      );
    }
  };

  const handleToggleSave = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, saved_by_me: !p.saved_by_me } : p
      )
    );

    try {
      await api.post(`/posts/${postId}/save`);

      // If viewing saved posts and we just unsaved — remove it from the list
      if (type === "saved" && post.saved_by_me) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, saved_by_me: !p.saved_by_me } : p
        )
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const diff = Date.now() - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-SG", { month: "short", day: "numeric" });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 2000,
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "85vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
            {titles[type]}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} color="#666" />
          </button>
        </div>

        {/* Feed */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "#999" }}>
              Loading...
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "12px 20px",
                fontSize: "13px",
                margin: "16px 20px",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "#999" }}>
              {type === "saved"
                ? "No saved posts yet — tap the bookmark on any post!"
                : type === "liked"
                ? "No liked posts yet."
                : "No posts yet."}
            </div>
          )}

          {!loading &&
            posts.map((post) => (
              <div
                key={post.id}
                style={{ borderBottom: "1px solid #e5e5e5", backgroundColor: "#fff" }}
              >
                {/* Post Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#f0f0f0",
                      backgroundImage: `url(${defaultPng})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
                      {post.username}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
                      {post.place_name || post.location_name}
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", flexShrink: 0 }}>
                    {formatDate(post.created_at)}
                  </div>
                </div>

                {/* Post Image */}
                {post.image_url && (
                  <div
                    style={{
                      width: "100%",
                      height: "400px",
                      overflow: "hidden",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <img
                      src={post.image_url}
                      alt="Post"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: post.liked_by_me ? "#e84c3d" : "#666",
                      display: "flex",
                      alignItems: "center",
                      transition: "transform 0.1s",
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.85)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <Heart size={20} fill={post.liked_by_me ? "#e84c3d" : "none"} />
                  </button>

                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <MessageCircle size={20} />
                  </button>

                  <button
                    onClick={() => handleToggleSave(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: post.saved_by_me ? "#2945A8" : "#666",
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      transition: "transform 0.1s",
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.85)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <Bookmark size={20} fill={post.saved_by_me ? "#2945A8" : "none"} />
                  </button>
                </div>

                {/* Likes & Rating */}
                <div style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "600", color: "#111" }}>
                  <div
                    style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Heart size={14} fill="#e84c3d" color="#e84c3d" />
                    {post.likes_count} {post.likes_count === 1 ? "like" : "likes"}
                  </div>
                  {post.rating && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      {post.rating}
                    </div>
                  )}
                </div>

                {/* Caption */}
                {post.description && (
                  <div
                    style={{
                      padding: "0 16px 10px",
                      fontSize: "14px",
                      color: "#111",
                      lineHeight: "1.4",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>{post.username}</span>{" "}
                    {post.description}
                  </div>
                )}

                {/* Comments */}
                {post.comments_count > 0 && (
                  <div
                    style={{
                      padding: "0 16px 12px",
                      fontSize: "13px",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    View all {post.comments_count} comments
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}