import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";
import { getAvatarSrc } from "../utils/avatarUtils";
import { useToast } from "../context/ToastContext";
import * as authService from "../services/authService";
import api from "../services/api";
import logoImg from "../assets/logo.png";
import defaultPng from "../assets/avatars/default.png";

import ProfileDashboard from "../components/profilePage/ProfileDashboard";
import AchievementsSection from "../components/profilePage/AchievementsSection";
import SettingsSection from "../components/profilePage/SettingsSection";
import StreakDisplay from "../components/profilePage/StreakDisplay";
import EditProfileModal from "../components/profilePage/EditProfileModal";
import TelegramConnectionModal from "../components/common/TelegramConnectionModal";
import AccountInfoModal from "../components/common/AccountInfoModal";
import PostsModal from "../components/common/PostsModal";
import AllAchievementsModal from "../components/common/AllAchievementsModal";
import FriendsModal from "../components/common/FriendsModal";


export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user, logout, setUser } = useAuth();
  const { pushToast } = useToast();
  const isViewingOtherProfile = !!username;

  const [stats, setStats] = useState({
    friends: 0,
    posts: 0,
    liked: 0,
    saved: 0,
  });
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [editModalTab, setEditModalTab] = useState("info");
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [postsModalType, setPostsModalType] = useState("posts");
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [equippedAvatar, setEquippedAvatar] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, streakRes, achievementsRes] = await Promise.allSettled([
        api.get("/auth/stats"),
        api.get("/auth/streak"),
        api.get("/auth/achievements"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        const {
          friends = 0,
          posts = 0,
          liked = 0,
          saved = 0,
        } = statsRes.value.data.data || {};

        setStats({
          friends,
          posts,
          liked,
          saved,
        });
      }

      if (streakRes.status === "fulfilled" && streakRes.value.data.success) {
        setStreak(streakRes.value.data.data);
      }

      if (
        achievementsRes.status === "fulfilled" &&
        achievementsRes.value.data.success
      ) {
        const { unlockedKeys = [], equippedAvatar: ea = null } =
          achievementsRes.value.data.data ?? {};

        setUnlockedAchievements(unlockedKeys);
        setEquippedAvatar(ea);
      }
    } catch {
      // fail silently — placeholders already in state
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAvatarChange = (newKey) => {
    setEquippedAvatar(newKey);

    const updatedUser = { ...user, equipped_avatar: newKey };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    showToast(newKey ? "Avatar updated!" : "Avatar removed");
  };

  const handleAvatarEquipFromAllAchievements = async (achievementKey) => {
    try {
      await api.put("/auth/achievements/equip", {
        achievementKey,
      });
      handleAvatarChange(achievementKey);
    } catch (err) {
      console.error("Failed to equip avatar from all achievements:", err);
      showToast("Could not equip this avatar", "error");
    }
  };

  const handleAvatarUnequipFromAllAchievements = async () => {
    try {
      await api.put("/auth/achievements/equip", {
        achievementKey: null,
      });
      handleAvatarChange(null);
    } catch (err) {
      console.error("Failed to unequip avatar from all achievements:", err);
      showToast("Could not remove this avatar", "error");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/@${user?.username}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      showToast("Profile link copied to clipboard!");
    });
  };

  const handleProfileSaved = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setShowEditModal(false);
    showToast("Profile updated successfully!");
  };

  const handleConnectTelegram = async (chatId) => {
    try {
      await authService.connectTelegram(chatId);
      const freshUser = await authService.fetchCurrentUser();

      if (freshUser) setUser(freshUser);

      showToast("Telegram connected!");
    } catch (error) {
      throw error;
    }
  };

  const handleDisconnectTelegram = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect your Telegram account? You won't receive OTP codes via Telegram anymore.",
      )
    ) {
      return;
    }

    try {
      await authService.disconnectTelegram();
      const freshUser = await authService.fetchCurrentUser();

      if (freshUser) setUser(freshUser);

      showToast("Telegram disconnected!");
    } catch (error) {
      showToast("Failed to disconnect Telegram", "error");
      console.error("Disconnect error:", error);
    }
  };

  const handleViewAll = (key) => {
    if (key === "friends") {
      setShowFriendsModal(true);
    } else {
      setPostsModalType(key);
      setShowPostsModal(true);
    }
  };

  const handleAccountInfo = () => {
    setShowAccountInfo(true);
  };

  const handleChangePassword = () => {
    setEditModalTab("password");
    setShowEditModal(true);
  };

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-SG", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
    : "";

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#faf9f7",
    padding: "0 0 32px 0",
  };

  const headerBarStyle = {
    backgroundColor: "#FCF1DD",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const bodyStyle = {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "20px 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const actionBtnStyle = (variant = "primary") => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: variant === "primary" ? "none" : "1.5px solid #F78660",
    backgroundColor: variant === "primary" ? "#F78660" : "transparent",
    color: variant === "primary" ? "#fff" : "#F78660",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "opacity 0.15s",
  });

  return (
    <div style={pageStyle}>
      <div style={headerBarStyle}>
        <img
          src={logoImg}
          alt="Grumble logo"
          style={{ width: "70px", height: "70px" }}
        />
        <span style={{ fontSize: "36px", fontWeight: "800", color: "#111" }}>
          Profile
        </span>
      </div>

      {toast.msg && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: toast.type === "success" ? "#166534" : "#1e40af",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "600",
            zIndex: 3000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {toast.msg}
        </div>
      )}

      <div style={bodyStyle}>
        {user && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
                marginTop: "4px",
              }}
            >
              <img
                src={getAvatarSrc(equippedAvatar)}
                alt="Profile avatar"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "contain",
                  backgroundColor: "#FCF1DD",
                  border: equippedAvatar ? "1px solid #cdcdcd" : "none",
                }}
                onError={(e) => {
                  e.currentTarget.src = defaultPng;
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: "22px", fontWeight: "800", color: "#111" }}
                >
                  {user.username}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#888",
                    marginTop: "2px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Foodie since {joinDate}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  width: "100%",
                }}
              >
                <button
                  style={actionBtnStyle("primary")}
                  onClick={() => setShowEditModal(true)}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Edit Profile
                </button>

                <button
                  style={actionBtnStyle("outline")}
                  onClick={handleShareProfile}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FCF1DD")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  ↗ Share Profile
                </button>
              </div>
            </div>

            <StreakDisplay
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
            />

            <ProfileDashboard stats={stats} onViewAll={handleViewAll} />

            <AchievementsSection
              unlockedKeys={unlockedAchievements}
              equippedAvatar={equippedAvatar}
              onViewAll={() => setShowAllAchievements(true)}
              onAvatarChange={handleAvatarChange}
            />

            <SettingsSection
              onAccountInfo={handleAccountInfo}
              onChangePassword={handleChangePassword}
              onHelpSupport={() => navigate("/help-support")}
            />

            <div
              style={{
                backgroundColor: "#FDDCB5",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Telegram Integration
              </div>

              {user.telegramChatId ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#166534" }}>
                    ✓ Connected as {user.telegramUsername || "your account"}
                  </div>
                  <button
                    onClick={handleDisconnectTelegram}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      width: "fit-content",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#dc2626")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ef4444")
                    }
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTelegramModal(true)}
                  style={{
                    backgroundColor: "#2945A8",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Connect Telegram
                </button>
              )}
            </div>
          </>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            backgroundColor: "#e53e3e",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "15px",
            fontWeight: "800",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "8px",
            boxShadow: "0 2px 8px rgba(229,62,62,0.3)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#c53030")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#e53e3e")
          }
        >
          Logout
        </button>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => {
            setShowEditModal(false);
            setEditModalTab("info");
          }}
          onSave={handleProfileSaved}
          initialTab={editModalTab}
        />
      )}

      {showAccountInfo && (
        <AccountInfoModal
          user={user}
          onClose={() => setShowAccountInfo(false)}
        />
      )}

      {showPostsModal && (
        <PostsModal
          type={postsModalType}
          onClose={() => {
            setShowPostsModal(false);
            fetchStats();
          }}
          pushToast={pushToast}
        />
      )}

      {showFriendsModal && (
        <FriendsModal onClose={() => setShowFriendsModal(false)} />
      )}

      {showAllAchievements && (
        <AllAchievementsModal
          unlockedKeys={unlockedAchievements}
          equippedAvatar={equippedAvatar}
          onClose={() => setShowAllAchievements(false)}
          onAvatarEquip={handleAvatarEquipFromAllAchievements}
          onAvatarUnequip={handleAvatarUnequipFromAllAchievements}
        />
      )}

      <TelegramConnectionModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onConnect={handleConnectTelegram}
        botUsername="@GrumblyGrumbot"
      />
    </div>
  );
}
