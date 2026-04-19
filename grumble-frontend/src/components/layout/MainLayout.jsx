import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import FloatingPet from "../common/FloatingPet";
import api from "../../services/api";
import { getRealtimeSocket } from "../../services/realtimeSocket";
import { ACHIEVEMENT_BY_KEY } from "../../utils/achievementCatalog";
import logoImg from "../../assets/logo.png";
import { ToastProvider } from "../../context/ToastContext";
import {
  buildAchievementToast,
  buildFriendRequestToast,
  buildFriendRequestAcceptedToast,
  buildPostLikeToast,
  buildPostCommentToast,
  buildPostSaveToast,
  buildPostShareToast,
  buildPendingRequestsToast,
  buildLoginAchievementToast,
  buildUnreadNotificationToast,
} from "../../utils/toastBuilders";

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
          <div
            style={{
              fontSize: "11px",
              color: toast.kickerColor,
              fontWeight: 700,
            }}
          >
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
          <div
            style={{
              fontSize: "11px",
              color: toast.bodyColor,
              marginTop: "2px",
            }}
          >
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

export default function MainLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [streak, setStreak] = useState(0);
  const [toasts, setToasts] = useState([]);
  const loginBootstrapDoneRef = useRef(false);

  const pushToast = (toast) => {
    console.log("Pushing toast:", toast);
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
        return;
      }

      if (payload?.type === "post_liked") {
        pushToast(buildPostLikeToast(payload));
        return;
      }

      if (payload?.type === "post_commented") {
        pushToast(buildPostCommentToast(payload));
        return;
      }

      if (payload?.type === "post_saved") {
        pushToast(buildPostSaveToast(payload));
        return;
      }

      if (payload?.type === "post_shared") {
        pushToast(buildPostShareToast(payload));
        return;
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
      <ToastProvider pushToast={pushToast}>
        <main
          className="flex-1 overflow-y-auto transition-all duration-300"
          style={{ marginLeft: isSidebarOpen ? "200px" : "80px" }}
        >
          <Outlet />
        </main>
      </ToastProvider>
      <FloatingPet streak={streak} />
    </div>
  );
}
