import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../services/api";
import {
  addMembersToChatRoom,
  getOrCreateDirectChatRoom,
} from "../services/chatService";
import { disconnectRealtimeSocket, getRealtimeSocket } from "../services/realtimeSocket";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import ChatList from "../components/chatsPage/ChatList";
import ChatWindow from "../components/chatsPage/ChatWindow";
import CreateGroupModal from "../components/chatsPage/CreateGroupModal";

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

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatView, setActiveChatView] = useState("chat");
  const [roomRefreshKey, setRoomRefreshKey] = useState(0);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [viewRestaurant, setViewRestaurant] = useState(null);
  const [unreadByRoomId, setUnreadByRoomId] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(null);
        await Promise.all([refreshChats(), refreshFriends()]);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load chats",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, isAuthenticated, refreshChats, refreshFriends]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      disconnectRealtimeSocket();
      return undefined;
    }

    const socket = getRealtimeSocket();
    if (!socket) return undefined;

    const handleNotificationAlert = (payload) => {
      const roomId = Number(payload?.room_id);
      if (!Number.isInteger(roomId)) return;

      if (activeChat?.id === roomId) {
        return;
      }

      setUnreadByRoomId((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || 0) + 1,
      }));

      void refreshChats();
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
    const friendItems = (friends || []).map((f) => ({
      id: `friend-${f.id}`,
      type: "friend",
      name: f.username,
      avatar_url: f.avatar_url,
      lastMessage: "",
      time: "",
      unread: 0,
      friend_user_id: f.id,
      raw: f,
    }));

    return [...groupItems, ...friendItems].map((item) => ({
      ...item,
      unread: unreadByRoomId[item.id] || 0,
    }));
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
        setUnreadByRoomId((prev) => ({
          ...prev,
          [room.id]: 0,
        }));

        // Ensure list ordering stays fresh (e.g., last_message fields).
        await refreshChats();
        return;
      }

      setUnreadByRoomId((prev) => ({
        ...prev,
        [item.id]: 0,
      }));
      setActiveChat(item);
    },
    [refreshChats],
  );

  const activeChatDisplay = useMemo(() => activeChat, [activeChat]);

  useEffect(() => {
    // Reset sub-view when switching chats.
    setActiveChatView("chat");
  }, [activeChatDisplay?.id]);

  if (activeChatDisplay)
    return (
      <div className="chats-page flex flex-col" style={{ height: "100dvh" }}>
        <ChatWindow
          chat={activeChatDisplay}
          onBack={() => setActiveChat(null)}
          onViewRestaurant={setViewRestaurant}
          onChatUpdated={refreshChats}
        />

        {viewRestaurant && (
          <div
            className="fixed inset-0 bg-black/60 z-[4000] flex items-center justify-center p-4"
            onClick={() => setViewRestaurant(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-48 bg-[#FCF1DD] flex items-center justify-center overflow-hidden">
                {viewRestaurant.photo_url ? (
                  <img
                    src={viewRestaurant.photo_url}
                    alt={viewRestaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FCF1DD] flex items-center justify-center text-6xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900">
                  {viewRestaurant.name}
                </h2>
                {viewRestaurant.address && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {viewRestaurant.address}
                  </p>
                )}
                <button
                  className="btn-primary w-full py-3 rounded-xl mt-4"
                  onClick={() => setViewRestaurant(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
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

      {error && <div className="px-4 py-2 text-sm text-red-600">{error}</div>}

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
