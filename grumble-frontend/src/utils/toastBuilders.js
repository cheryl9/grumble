import logoImg from "../assets/logo.png";
import { ACHIEVEMENT_BY_KEY } from "./achievementCatalog";

export function buildAchievementToast(payload) {
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

export function buildFriendRequestToast(payload) {
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

export function buildFriendRequestAcceptedToast(payload) {
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

export function buildPostLikeToast(payload) {
  const username = payload?.likerUsername || "Someone";
  const postPreview = payload?.postPreview || "your post";

  return {
    id: `post-like-${Date.now()}-${payload?.likerId ?? "unknown"}`,
    kind: "post_like",
    kicker: "Post engagement",
    title: `${username} liked ${postPreview}`,
    body: "Check it out!",
    image: logoImg,
    borderColor: "#fca5a5",
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    shadow: "0 10px 24px rgba(220, 38, 38, 0.15)",
    kickerColor: "#dc2626",
    titleColor: "#7f1d1d",
    bodyColor: "#991b1b",
    actionBackground: "#dc2626",
    actionColor: "#fff",
    closeColor: "#991b1b",
  };
}

export function buildPostCommentToast(payload) {
  const username = payload?.commenterUsername || "Someone";
  const postPreview = payload?.postPreview || "your post";

  return {
    id: `post-comment-${Date.now()}-${payload?.commenterId ?? "unknown"}`,
    kind: "post_comment",
    kicker: "Post engagement",
    title: `${username} commented on ${postPreview}`,
    body: "There's discussion on your post!",
    image: logoImg,
    borderColor: "#a78bfa",
    background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
    shadow: "0 10px 24px rgba(124, 58, 202, 0.15)",
    kickerColor: "#6b21a8",
    titleColor: "#4c0519",
    bodyColor: "#6b21a8",
    actionBackground: "#7c3aed",
    actionColor: "#fff",
    closeColor: "#6b21a8",
  };
}

export function buildPostSaveToast(payload) {
  const username = payload?.saverUsername || "Someone";
  const postPreview = payload?.postPreview || "your post";

  return {
    id: `post-save-${Date.now()}-${payload?.saverId ?? "unknown"}`,
    kind: "post_save",
    kicker: "Post engagement",
    title: `${username} saved ${postPreview}`,
    body: "Your content is appreciated!",
    image: logoImg,
    borderColor: "#fbbf24",
    background: "linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)",
    shadow: "0 10px 24px rgba(180, 83, 9, 0.15)",
    kickerColor: "#b45309",
    titleColor: "#78350f",
    bodyColor: "#92400e",
    actionBackground: "#f59e0b",
    actionColor: "#fff",
    closeColor: "#78350f",
  };
}

export function buildPostShareToast(payload) {
  const username = payload?.sharerUsername || "Someone";
  const postPreview = payload?.postPreview || "your post";

  return {
    id: `post-share-${Date.now()}-${payload?.sharerId ?? "unknown"}`,
    kind: "post_share",
    kicker: "Post engagement",
    title: `${username} shared ${postPreview}`,
    body: "Your post is spreading!",
    image: logoImg,
    borderColor: "#86efac",
    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    shadow: "0 10px 24px rgba(22, 163, 74, 0.15)",
    kickerColor: "#16a34a",
    titleColor: "#14532d",
    bodyColor: "#166534",
    actionBackground: "#16a34a",
    actionColor: "#fff",
    closeColor: "#14532d",
  };
}

export function buildPendingRequestsToast(requests = []) {
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

export function buildLoginAchievementToast(achievementKey) {
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

export function buildUnreadNotificationToast(notification) {
  if (!notification?.type) return null;

  if (notification.type === "friend_request_accepted") {
    return {
      id: `notif-${notification.id}`,
      kind: "friend_request_accepted",
      kicker: "A new friendship!",
      title: notification.title || "Your friend request was accepted!",
      body:
        notification.body ||
        "You can start chatting or check the friends page.",
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

// Local action toasts (for user actions, not from server notifications)
export function buildLocalActionToast(type, message) {
  const toastConfigs = {
    like_sent: {
      emoji: "❤️",
      kicker: "Action sent",
      title: message || "Like sent!",
      borderColor: "#fca5a5",
      background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      kickerColor: "#dc2626",
      titleColor: "#7f1d1d",
      bodyColor: "#991b1b",
      closeColor: "#991b1b",
    },
    comment_sent: {
      emoji: "💬",
      kicker: "Action sent",
      title: message || "Comment added!",
      borderColor: "#a78bfa",
      background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
      kickerColor: "#6b21a8",
      titleColor: "#4c0519",
      bodyColor: "#6b21a8",
      closeColor: "#6b21a8",
    },
    save_sent: {
      emoji: "🔖",
      kicker: "Action sent",
      title: message || "Post saved!",
      borderColor: "#fbbf24",
      background: "linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)",
      kickerColor: "#b45309",
      titleColor: "#78350f",
      bodyColor: "#92400e",
      closeColor: "#78350f",
    },
    friend_request_sent: {
      emoji: "👋",
      kicker: "Action sent",
      title: message || "Friend request sent!",
      borderColor: "#93c5fd",
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      kickerColor: "#1d4ed8",
      titleColor: "#1e3a8a",
      bodyColor: "#1e40af",
      closeColor: "#1e40af",
    },
    friend_request_accepted: {
      emoji: "✅",
      kicker: "Action completed",
      title: message || "Friend request accepted!",
      borderColor: "#86efac",
      background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      kickerColor: "#166534",
      titleColor: "#14532d",
      bodyColor: "#166534",
      closeColor: "#14532d",
    },
    friend_request_declined: {
      emoji: "👋",
      kicker: "Action completed",
      title: message || "Friend request declined.",
      borderColor: "#f87171",
      background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      kickerColor: "#dc2626",
      titleColor: "#7f1d1d",
      bodyColor: "#991b1b",
      closeColor: "#991b1b",
    },
  };

  const config = toastConfigs[type] || toastConfigs.like_sent;

  return {
    id: `local-action-${Date.now()}-${Math.random()}`,
    kind: type,
    kicker: config.kicker,
    title: config.title,
    body: "",
    emoji: config.emoji,
    borderColor: config.borderColor,
    background: config.background,
    shadow: "0 10px 24px rgba(0, 0, 0, 0.1)",
    kickerColor: config.kickerColor,
    titleColor: config.titleColor,
    bodyColor: config.bodyColor,
    closeColor: config.closeColor,
    actionLabel: null,
    actionBackground: "#ffffff",
    actionColor: "#000000",
  };
}
