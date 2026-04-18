import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import FloatingPet from "../common/FloatingPet";
import api from "../../services/api";
import { getRealtimeSocket } from "../../services/realtimeSocket";
import { ACHIEVEMENT_BY_KEY } from "../../utils/achievementCatalog";
import logoImg from "../../assets/logo.png";

function GlobalToast({ toast, onClose, onAction }) {
  const topOffset = 20 + toast.index * 94;

  return (
    <div
      style={{
        position: "fixed",
        top: `${topOffset}px`,
        right: "18px",
        width: "min(340px, calc(100vw - 32px))",
        borderRadius: "16px",
        border: `1px solid ${toast.borderColor}`,
        background: toast.background,
        padding: "12px 13px",
        zIndex: 6000,
        boxShadow: toast.shadow,
        animation: "globalToastIn 220ms ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `inset 0 0 0 1px ${toast.borderColor}`,
            flexShrink: 0,
            fontSize: "20px",
          }}
        >
          {toast.image ? (
            <img
              src={toast.image}
              alt={toast.title}
              style={{ width: "30px", height: "30px", objectFit: "contain" }}
            />
          ) : (
            <span>{toast.emoji}</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", color: toast.kickerColor, fontWeight: 700 }}>
            {toast.kicker}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: toast.titleColor,
              fontWeight: 800,
              lineHeight: 1.25,
              marginTop: "2px",
            }}
          >
            {toast.title}
          </div>
          <div style={{ fontSize: "11px", color: toast.bodyColor, marginTop: "2px" }}>
            {toast.body}
          </div>

          {toast.actionLabel && (
            <button
              onClick={() => onAction(toast)}
              style={{
                marginTop: "7px",
                fontSize: "11px",
                fontWeight: 700,
                border: "none",
                borderRadius: "999px",
                padding: "4px 10px",
                cursor: "pointer",
                background: toast.actionBackground,
                color: toast.actionColor,
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>

        <button
          onClick={() => onClose(toast.id)}
          aria-label="Dismiss notification"
          style={{
            border: "none",
            background: "transparent",
            color: toast.closeColor,
            fontSize: "15px",
            lineHeight: 1,
            cursor: "pointer",
            marginTop: "1px",
            padding: "2px",
          }}
        >
          x
        </button>
      </div>

      <style>
        {`@keyframes globalToastIn {
          from { transform: translateX(14px) scale(0.96); opacity: 0; }
          to   { transform: translateX(0) scale(1); opacity: 1; }
        }`}
      </style>
    </div>
  );
}

function buildAchievementToast(payload) {
  const keys = Array.isArray(payload?.achievementKeys)
    ? payload.achievementKeys.filter((key) => ACHIEVEMENT_BY_KEY[key])
    : [];

  if (keys.length === 0) return null;

  const primary = ACHIEVEMENT_BY_KEY[keys[0]];
  const countLabel = keys.length > 1 ? ` +${keys.length - 1} more` : "";

  return {
    id: `achievement-${Date.now()}-${keys.join("-")}`,
    kind: "achievement",
    kicker: "Yummy achievement unlocked!",
    title: `${primary.label}${countLabel}`,
    body: "Check your profile now!.",
    image: primary.image,
    actionLabel: "Open Profile",
    actionTo: "/profile",
    borderColor: "#ffd18a",
    background: "linear-gradient(135deg, #fff9e8 0%, #ffe9c6 100%)",
    shadow: "0 10px 24px rgba(122, 66, 16, 0.18)",
    kickerColor: "#995300",
    titleColor: "#2f1a00",
    bodyColor: "#7a5320",
    actionBackground: "#f59e0b",
    actionColor: "#fff",
    closeColor: "#7a5320",
  };
}

function buildFriendRequestToast(payload) {
  const username = payload?.requesterUsername || "Someone";

  return {
    id: `friend-request-${Date.now()}-${payload?.requesterId ?? "unknown"}`,
    kind: "friend_request",
    kicker: "Incoming friendship ping",
    title: `New friend request from ${username}!`,
    body: "Tap below to check your requests.",
    image: logoImg,
    actionLabel: "View Requests",
    actionTo: "/friends",
    borderColor: "#93c5fd",
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    shadow: "0 10px 24px rgba(37, 99, 235, 0.15)",
    kickerColor: "#1d4ed8",
    titleColor: "#1e3a8a",
    bodyColor: "#1e40af",
    actionBackground: "#2563eb",
    actionColor: "#fff",
    closeColor: "#1e40af",
  };
}

function buildFriendRequestAcceptedToast(payload) {
  const username = payload?.accepterUsername || "Someone";

  return {
    id: `friend-request-accepted-${Date.now()}-${payload?.accepterId ?? "unknown"}`,
    kind: "friend_request_accepted",
    kicker: "A new friendship!",
    title: `${username} accepted your friend request!`,
    body: "You can start chatting or check the friends page.",
    image: logoImg,
    actionLabel: "View Friends",
    actionTo: "/friends",
    borderColor: "#86efac",
    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    shadow: "0 10px 24px rgba(22, 101, 52, 0.15)",
    kickerColor: "#166534",
    titleColor: "#14532d",
    bodyColor: "#166534",
    actionBackground: "#16a34a",
    actionColor: "#fff",
    closeColor: "#14532d",
  };
}

function buildPendingRequestsToast(requests = []) {
  if (!Array.isArray(requests) || requests.length === 0) return null;

  const first = requests[0];
  const firstName = first?.requester_username || "someone";
  const extra = requests.length > 1 ? ` and ${requests.length - 1} more` : "";

  return {
    id: `friend-request-login-${Date.now()}`,
    kind: "friend_request",
    kicker: "Welcome back",
    title: `You have a friend request from ${firstName}${extra}!`,
    body: "Open requests now and decide who to accept.",
    image: logoImg,
    actionLabel: "View Requests",
    actionTo: "/friends",
    borderColor: "#93c5fd",
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    shadow: "0 10px 24px rgba(37, 99, 235, 0.15)",
    kickerColor: "#1d4ed8",
    titleColor: "#1e3a8a",
    bodyColor: "#1e40af",
    actionBackground: "#2563eb",
    actionColor: "#fff",
    closeColor: "#1e40af",
  };
}

function buildLoginAchievementToast(achievementKey) {
  const achievement = ACHIEVEMENT_BY_KEY[achievementKey];
  if (!achievement) return null;

  return {
    id: `achievement-login-${Date.now()}-${achievementKey}`,
    kind: "achievement",
    kicker: "Yummy achievement unlocked!",
    title: achievement.label,
    body: "Your new avatar is ready to equip.",
    image: achievement.image,
    actionLabel: "Open Profile",
    actionTo: "/profile",
    borderColor: "#ffd18a",
    background: "linear-gradient(135deg, #fff9e8 0%, #ffe9c6 100%)",
    shadow: "0 10px 24px rgba(122, 66, 16, 0.18)",
    kickerColor: "#995300",
    titleColor: "#2f1a00",
    bodyColor: "#7a5320",
    actionBackground: "#f59e0b",
    actionColor: "#fff",
    closeColor: "#7a5320",
  };
}

function buildUnreadNotificationToast(notification) {
  if (!notification?.type) return null;

  if (notification.type === "friend_request_accepted") {
    return {
      id: `notif-${notification.id}`,
      kind: "friend_request_accepted",
      kicker: "A new friendship!",
      title: notification.title || "Your friend request was accepted!",
      body: notification.body || "You can start chatting or check the friends page.",
      image: logoImg,
      actionLabel: "View Friends",
      actionTo: "/friends",
      borderColor: "#86efac",
      background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      shadow: "0 10px 24px rgba(22, 101, 52, 0.15)",
      kickerColor: "#166534",
      titleColor: "#14532d",
      bodyColor: "#166534",
      actionBackground: "#16a34a",
      actionColor: "#fff",
      closeColor: "#14532d",
    };
  }

  return null;
}

export default function MainLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [streak, setStreak] = useState(0);
  const [toasts, setToasts] = useState([]);
  const loginBootstrapDoneRef = useRef(false);

  const pushToast = (toast) => {
    if (!toast) return;

    setToasts((prev) => [...prev, toast].slice(-4));

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 5600);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToastAction = (toast) => {
    if (toast?.actionTo) {
      navigate(toast.actionTo);
    }
    dismissToast(toast.id);
  };

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await api.get("/auth/streak");
        if (res.data.success) {
          setStreak(res.data.data.currentStreak || 0);
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      }
    };

    fetchStreak();
  }, []);

  useEffect(() => {
    if (loginBootstrapDoneRef.current) return;
    loginBootstrapDoneRef.current = true;

    const bootstrapNotifications = async () => {
      try {
        const [friendRequestsRes, achievementsRes] = await Promise.all([
          api.get("/friends/requests"),
          api.get("/auth/achievements"),
        ]);

        const requests = Array.isArray(friendRequestsRes.data)
          ? friendRequestsRes.data
          : [];

        if (requests.length > 0) {
          pushToast(buildPendingRequestsToast(requests));
        }

        const newlyUnlockedKeys = Array.isArray(
          achievementsRes.data?.data?.newlyUnlockedKeys,
        )
          ? achievementsRes.data.data.newlyUnlockedKeys
          : [];

        newlyUnlockedKeys.forEach((achievementKey) => {
          pushToast(buildLoginAchievementToast(achievementKey));
        });

        const notificationsRes = await api.get("/notifications/unread");
        const unreadNotifications = Array.isArray(notificationsRes.data?.data)
          ? notificationsRes.data.data
          : [];

        unreadNotifications
          .map(buildUnreadNotificationToast)
          .filter(Boolean)
          .forEach((toast) => pushToast(toast));
      } catch (error) {
        // Silent fail: realtime notifications will still work once connected.
      }
    };

    bootstrapNotifications();
  }, []);

  useEffect(() => {
    const socket = getRealtimeSocket();
    if (!socket) return undefined;

    const handleNotificationAlert = (payload) => {
      if (payload?.type === "achievement_unlocked") {
        pushToast(buildAchievementToast(payload));
        return;
      }

      if (payload?.type === "friend_request_received") {
        pushToast(buildFriendRequestToast(payload));
        return;
      }

      if (payload?.type === "friend_request_accepted") {
        pushToast(buildFriendRequestAcceptedToast(payload));
      }
    };

    socket.on("notification_alert", handleNotificationAlert);

    return () => {
      socket.off("notification_alert", handleNotificationAlert);
    };
  }, [navigate]);

  return (
    <div className="flex h-screen">
      {toasts.map((toast, index) => (
        <GlobalToast
          key={toast.id}
          toast={{ ...toast, index }}
          onClose={dismissToast}
          onAction={handleToastAction}
        />
      ))}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "200px" : "80px" }}
      >
        <Outlet />
      </main>
      <FloatingPet streak={streak} />
    </div>
  );
}
