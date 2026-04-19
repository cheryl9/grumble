import React, { useEffect, useMemo, useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "./Avatar";
import ChatMessage from "./ChatMessage";
import { getChatRoom } from "../../services/chatService";
import {
  subscribeToRoom,
  unsubscribeFromRoom,
} from "../../services/realtimeSocket";

const ChatWindow = ({
  chat,
  onBack,
  onViewRestaurant,
  onChatUpdated,
  onOpenGroupInfo,
}) => {
  const { user } = useAuth();
  const roomId = chat?.id;

  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const [input, setInput] = useState("");
  const [showActions, setShowActions] = useState(false);

  const [showPollModal, setShowPollModal] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);

  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["", ""]);
  const [wheelOpts, setWheelOpts] = useState(["", ""]);
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [foodSearchLoading, setFoodSearchLoading] = useState(false);
  const [foodSearchError, setFoodSearchError] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [roomRes, msgRes] = await Promise.all([
          getChatRoom(roomId),
          api.get(`/chats/${roomId}/messages`, {
            params: { limit: 50, offset: 0 },
          }),
        ]);

        if (cancelled) return;

        const roomData = roomRes;
        setRoom(roomData);
        setMembers(roomData?.members || []);

        const fetched = (msgRes.data?.data || []).slice().reverse();
        setMessages(fetched);
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.response?.data?.message || err?.message || "Failed to load chat",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const socket = subscribeToRoom(roomId);
    if (socket) {
      const handleRoomEvent = (event) => {
        if (Number(event?.room_id) !== Number(roomId)) return;

        if (event?.event === "new_message" && event?.payload?.message) {
          const nextMessage = event.payload.message;
          setMessages((prev) => {
            const alreadyExists = prev.some((msg) => msg.id === nextMessage.id);
            return alreadyExists ? prev : [...prev, nextMessage];
          });
          onChatUpdated?.();
        }
      };

      socket.on("room_event", handleRoomEvent);

      return () => {
        cancelled = true;
        socket.off("room_event", handleRoomEvent);
        unsubscribeFromRoom(roomId);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const displayName = useMemo(() => {
    const fallback = chat?.name || "Chat";
    if (!room) return fallback;

    if (room.type === "direct" && user?.id) {
      const other = (members || []).find(
        (m) => Number(m.user_id) !== Number(user.id),
      );
      return other?.username || fallback;
    }

    return room.name || fallback;
  }, [room, members, user?.id, chat?.name]);

  const memberNames = useMemo(
    () => (members || []).map((m) => m.username),
    [members],
  );

  const appendMessage = (newMessage) => {
    if (!newMessage) return;
    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === newMessage.id);
      return exists ? prev : [...prev, newMessage];
    });
  };

  const sendTextMessage = async () => {
    const text = input.trim();
    if (!text || !roomId || sending) return;

    try {
      setSending(true);
      setError(null);

      const res = await api.post(`/chats/${roomId}/messages`, {
        type: "text",
        content: { text },
      });

      appendMessage(res.data?.data);
      setInput("");
      setShowActions(false);
      onChatUpdated?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  };

  const sendPoll = async () => {
    const question = pollQ.trim();
    const options = pollOpts.map((o) => o.trim()).filter(Boolean);
    if (!question || options.length < 2 || !roomId || sending) return;

    try {
      setSending(true);
      setError(null);

      const res = await api.post(`/chats/${roomId}/messages`, {
        type: "poll",
        content: { question, options },
      });

      appendMessage(res.data?.data);
      setPollQ("");
      setPollOpts(["", ""]);
      setShowPollModal(false);
      onChatUpdated?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to send poll",
      );
    } finally {
      setSending(false);
    }
  };

  const sendWheel = async () => {
    const options = wheelOpts.map((o) => o.trim()).filter(Boolean);
    if (options.length < 2 || !roomId || sending) return;

    try {
      setSending(true);
      setError(null);

      const res = await api.post(`/chats/${roomId}/messages`, {
        type: "spin_wheel",
        content: { options },
      });

      appendMessage(res.data?.data);
      setWheelOpts(["", ""]);
      setShowWheelModal(false);
      onChatUpdated?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to send wheel",
      );
    } finally {
      setSending(false);
    }
  };

  const searchFoodPlaces = async () => {
    const q = foodQuery.trim();
    if (!q) {
      setFoodResults([]);
      setFoodSearchError(null);
      return;
    }

    try {
      setFoodSearchLoading(true);
      setFoodSearchError(null);

      const res = await api.get("/food-places", {
        params: { q, limit: 10, enrich: "false" },
      });

      setFoodResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setFoodResults([]);
      setFoodSearchError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to search food places",
      );
    } finally {
      setFoodSearchLoading(false);
    }
  };

  const sendFoodSuggestion = async (foodPlaceId) => {
    if (!foodPlaceId || !roomId || sending) return;

    // Handle both database IDs (numbers) and Google Place IDs (strings)
    const contentValue =
      typeof foodPlaceId === "string" && foodPlaceId.startsWith("ChIJ")
        ? foodPlaceId // Google Place ID
        : Number(foodPlaceId); // Database ID

    try {
      setSending(true);
      setError(null);

      const res = await api.post(`/chats/${roomId}/messages`, {
        type: "food_suggestion",
        content: { food_place_id: contentValue },
      });

      appendMessage(res.data?.data);
      setFoodQuery("");
      setFoodResults([]);
      setFoodSearchError(null);
      setShowFoodModal(false);
      onChatUpdated?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to suggest food",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#FCF1DD] border-b border-orange-100 flex-shrink-0">
        <button onClick={onBack} className="btn-ghost p-1 rounded-full">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (room?.type !== "group") return;
            onOpenGroupInfo?.();
          }}
          className={`flex items-center gap-3 min-w-0 text-left ${
            room?.type === "group" ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <Avatar
            name={displayName}
            src={room?.avatar_url || chat?.avatar_url || null}
            size="sm"
          />

          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">
              {displayName}
            </p>
            {memberNames.length > 0 && (
              <p className="text-xs text-gray-400 truncate">
                {memberNames.join(", ")}
              </p>
            )}
          </div>
        </button>
      </div>

      {error && <div className="px-4 py-2 text-sm text-red-600">{error}</div>}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading…</div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              currentUserId={user?.id}
              onViewRestaurant={onViewRestaurant}
            />
          ))
        )}
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowActions((s) => !s)}
            className="w-9 h-9 rounded-full bg-[#F78660] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#2945A8] transition-colors"
            disabled={sending}
          >
            <Plus size={18} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendTextMessage()}
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#F78660] bg-gray-50"
            disabled={sending}
          />
          <button
            onClick={sendTextMessage}
            className="btn-primary px-4 py-2 rounded-full text-sm"
            disabled={sending}
          >
            Send
          </button>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setShowPollModal(true);
                setShowActions(false);
              }}
              className="flex-1 py-2 rounded-xl bg-[#FCF1DD] text-[#F78660] text-xs font-bold hover:bg-orange-100 transition-colors"
            >
              Poll
            </button>
            <button
              onClick={() => {
                setShowWheelModal(true);
                setShowActions(false);
              }}
              className="flex-1 py-2 rounded-xl bg-[#FCF1DD] text-[#F78660] text-xs font-bold hover:bg-orange-100 transition-colors"
            >
              Spin Wheel
            </button>
            <button
              onClick={() => {
                setShowFoodModal(true);
                setShowActions(false);
              }}
              className="flex-1 py-2 rounded-xl bg-[#FCF1DD] text-[#F78660] text-xs font-bold hover:bg-orange-100 transition-colors"
            >
              Suggest Food
            </button>
          </div>
        )}
      </div>

      {showPollModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[3000] flex items-end justify-center"
          onClick={() => setShowPollModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-0.5 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Create a Poll
            </h2>
            <input
              type="text"
              placeholder="Ask a question..."
              value={pollQ}
              onChange={(e) => setPollQ(e.target.value)}
              className="input-field mb-3"
            />
            <div className="space-y-2 mb-3">
              {pollOpts.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const n = [...pollOpts];
                    n[i] = e.target.value;
                    setPollOpts(n);
                  }}
                  className="input-field"
                />
              ))}
            </div>
            <button
              onClick={() => setPollOpts([...pollOpts, ""])}
              className="btn-secondary w-full py-2 rounded-xl text-sm mb-3"
              disabled={sending}
            >
              + Add option
            </button>
            <button
              onClick={sendPoll}
              className="btn-primary w-full py-3 rounded-xl"
              disabled={sending}
            >
              Send Poll
            </button>
          </div>
        </div>
      )}

      {showWheelModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[3000] flex items-end justify-center"
          onClick={() => setShowWheelModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-0.5 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Spin the Wheel
            </h2>
            <div className="space-y-2 mb-3">
              {wheelOpts.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Place ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const n = [...wheelOpts];
                    n[i] = e.target.value;
                    setWheelOpts(n);
                  }}
                  className="input-field"
                />
              ))}
            </div>
            <button
              onClick={() => setWheelOpts([...wheelOpts, ""])}
              className="btn-secondary w-full py-2 rounded-xl text-sm mb-3"
              disabled={sending}
            >
              + Add place
            </button>
            <button
              onClick={sendWheel}
              className="btn-primary w-full py-3 rounded-xl"
              disabled={sending}
            >
              Send Wheel
            </button>
          </div>
        </div>
      )}

      {showFoodModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[3000] flex items-end justify-center"
          onClick={() => setShowFoodModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-0.5 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Suggest Food
            </h2>
            <p className="text-sm text-gray-400 mb-4">Search by shop name</p>
            <input
              type="text"
              placeholder="e.g. Din Tai Fung"
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchFoodPlaces()}
              className="input-field mb-2"
            />

            {foodSearchError && (
              <div className="text-sm text-red-600 mb-2">{foodSearchError}</div>
            )}

            <button
              onClick={searchFoodPlaces}
              className="btn-secondary w-full py-2 rounded-xl text-sm mb-3"
              disabled={sending || foodSearchLoading}
            >
              {foodSearchLoading ? "Searching…" : "Search"}
            </button>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {!foodSearchLoading &&
              foodQuery.trim() &&
              foodResults.length === 0 ? (
                <div className="text-sm text-gray-400">No matches found.</div>
              ) : (
                foodResults.map((p) => {
                  const address =
                    p?.google?.address || p?.address || "Address unavailable";
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => sendFoodSuggestion(p.id)}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                      disabled={sending}
                    >
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {p?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                        {address}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
