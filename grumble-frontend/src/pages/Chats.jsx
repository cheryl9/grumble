import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../services/api";
import {
  addMembersToChatRoom,
  getOrCreateDirectChatRoom,
} from "../services/chatService";
import {
  disconnectRealtimeSocket,
  getRealtimeSocket,
} from "../services/realtimeSocket";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useChatUnread } from "../context/ChatUnreadContext";
import logo from "../assets/logo.png";
import ChatList from "../components/chatsPage/ChatList";
import ChatWindow from "../components/chatsPage/ChatWindow";
import CreateGroupModal from "../components/chatsPage/CreateGroupModal";
import GroupChatInfo from "../components/chatsPage/GroupChatInfo";
import RestaurantDetailModal from "../components/findSpotsPage/RestaurantDetailModal";

const formatRelativeTime = (ts) => {
  if (!ts) return "";
  try {
    // Add 8 hours to compensate for Singapore timezone (UTC+8)
    const date = new Date(ts);
    date.setHours(date.getHours() + 8);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "";
  }
};

const buildLastMessagePreview = (room) => {
  const type = room?.last_message_type;
  const content = room?.last_message;

  if (!type) return "";

  if (type === "text") return content?.text || "New message";
  if (type === "poll")
    return content?.question ? `Poll: ${content.question}` : "Poll";
  if (type === "food_suggestion") return "Food suggestion";
  if (type === "spin_wheel") return "Spin wheel";

  return "New message";
};

const mapRoomToChatListItem = (room) => {
  const name = room?.name || (room?.type === "direct" ? "Direct chat" : "Chat");
  return {
    id: room.id,
    type: room.type,
    name,
    avatar_url: room.avatar_url,
    lastMessage: buildLastMessagePreview(room),
    time: formatRelativeTime(room.last_message_at || room.created_at),
    unread: 0,
    raw: room,
  };
};

const Chats = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { showErrorToast } = useToast();
  const { unreadByRoomId, markRoomRead, setActiveRoomId } = useChatUnread();

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatView, setActiveChatView] = useState("chat");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [viewRestaurant, setViewRestaurant] = useState(null);

  const [loading, setLoading] = useState(true);

  const refreshChats = useCallback(async () => {
    const res = await api.get("/chats");
    const rooms = res.data?.data || [];
    setChats(rooms.map(mapRoomToChatListItem));
  }, []);

  const refreshFriends = useCallback(async () => {
    const res = await api.get("/friends");
    setFriends(res.data?.data || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (authLoading) return;
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        await Promise.all([refreshChats(), refreshFriends()]);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load chats";
        showErrorToast(msg, "Chats");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    authLoading,
    isAuthenticated,
    refreshChats,
    refreshFriends,
    showErrorToast,
  ]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      disconnectRealtimeSocket();
      return undefined;
    }

    const socket = getRealtimeSocket();
    if (!socket) return undefined;

    const handleNotificationAlert = (payload) => {
      // Only treat untyped alerts as message notifications.
      // Typed alerts are handled by MainLayout global toasts.
      if (payload?.type) return;

      const roomId = Number(payload?.room_id);
      if (!Number.isInteger(roomId)) return;

      // Unread counts are handled globally; Chats page only refreshes list ordering.
      if (activeChat?.id !== roomId) {
        void refreshChats();
      }
    };

    socket.on("notification_alert", handleNotificationAlert);

    return () => {
      socket.off("notification_alert", handleNotificationAlert);
    };
  }, [activeChat?.id, authLoading, isAuthenticated, refreshChats]);

  const handleCreateGroup = async (title, memberIds) => {
    const name = title.trim();
    if (!name || !memberIds?.length) return;

    const roomRes = await api.post("/chats", { type: "group", name });
    const room = roomRes.data?.data;

    if (!room?.id) throw new Error("Failed to create chat room");

    await addMembersToChatRoom(room.id, memberIds);

    await refreshChats();
  };

  const chatListItems = useMemo(() => {
    const groupItems = (chats || []).filter((c) => c.type === "group");

    // Build a map of user IDs to their direct chat rooms for efficient lookup
    const directChatByUserId = new Map();
    (chats || [])
      .filter((c) => c.type === "direct")
      .forEach((room) => {
        const otherUserId = Number(room?.raw?.other_user_id);
        if (Number.isInteger(otherUserId)) {
          directChatByUserId.set(otherUserId, room);
        }
      });

    const friendItems = (friends || []).map((f) => {
      // Find the direct chat room for this friend using other_user_id
      const directChat = directChatByUserId.get(Number(f.id));

      return {
        id: `friend-${f.id}`,
        type: "friend",
        name: f.username,
        avatar_url: f.avatar_url,
        // `directChat` here is already a mapped chat list item.
        // Reuse its derived fields instead of expecting raw DB columns.
        lastMessage: directChat?.lastMessage || "",
        time: directChat?.time || "",
        unread: 0,
        friend_user_id: f.id,
        raw: f,
        roomId: directChat?.id,
      };
    });

    return [...groupItems, ...friendItems].map((item) => {
      const unreadKey = item.roomId ?? item.id;
      return {
        ...item,
        unread: unreadByRoomId[unreadKey] || 0,
      };
    });
  }, [chats, friends, unreadByRoomId]);

  const handleSelectChat = useCallback(
    async (item) => {
      if (!item) return;

      if (item.type === "friend") {
        const friendUserId = Number(item.friend_user_id);
        if (!Number.isInteger(friendUserId)) return;

        const room = await getOrCreateDirectChatRoom(friendUserId);
        if (!room?.id) throw new Error("Failed to open direct chat");

        setActiveChat({
          id: room.id,
          type: room.type,
          name: item.name,
          avatar_url: room.avatar_url,
          raw: room,
        });
        setActiveRoomId(room.id);
        markRoomRead(room.id);

        // Ensure list ordering stays fresh (e.g., last_message fields).
        await refreshChats();
        return;
      }

      setActiveRoomId(item.id);
      markRoomRead(item.id);
      setActiveChat(item);
    },
    [markRoomRead, refreshChats, setActiveRoomId],
  );

  const activeChatDisplay = useMemo(() => activeChat, [activeChat]);

  useEffect(() => {
    // Reset sub-view when switching chats.
    setActiveChatView("chat");
  }, [activeChatDisplay?.id]);

  useEffect(() => {
    // Keep global unread suppression in sync with the currently open room.
    setActiveRoomId(activeChatDisplay?.id ?? null);
  }, [activeChatDisplay?.id, setActiveRoomId]);

  if (activeChatDisplay)
    return (
      <div className="chats-page flex flex-col" style={{ height: "100dvh" }}>
        {activeChatView === "groupInfo" &&
        activeChatDisplay?.type === "group" ? (
          <GroupChatInfo
            roomId={activeChatDisplay.id}
            onBack={() => setActiveChatView("chat")}
            onLeftGroup={() => {
              setActiveChatView("chat");
              setActiveChat(null);
            }}
            onRoomUpdated={refreshChats}
          />
        ) : (
          <ChatWindow
            chat={activeChatDisplay}
            onBack={() => {
              setActiveChatView("chat");
              setActiveRoomId(null);
              setActiveChat(null);
            }}
            onViewRestaurant={setViewRestaurant}
            onChatUpdated={refreshChats}
            onOpenGroupInfo={() => setActiveChatView("groupInfo")}
          />
        )}

        {viewRestaurant && (
          <RestaurantDetailModal
            restaurant={{
              id: viewRestaurant.id,
              name: viewRestaurant.name,
              image: viewRestaurant.photo_url,
              location: viewRestaurant.address,
            }}
            onClose={() => setViewRestaurant(null)}
          />
        )}
      </div>
    );

  return (
    <div className="chats-page">
      <div className="explore-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Grumble" className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Chats</h1>
          </div>
        </div>
      </div>

      {/* Errors are shown via global toasts */}

      <ChatList
        chats={chatListItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectChat={handleSelectChat}
        onCreateGroup={() => setShowCreateGroup(true)}
        isLoading={loading}
      />

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={async (title, memberIds) => {
            await handleCreateGroup(title, memberIds);
            setShowCreateGroup(false);
          }}
          friends={friends}
        />
      )}
    </div>
  );
};

export default Chats;
