import React, { useMemo } from "react";
import { format } from "date-fns";
import Avatar from "./Avatar";
import Poll from "./Poll";
import SpinWheel from "./Spinwheel";
import FoodSuggestion from "./FoodSuggestion";

const formatMessageTime = (ts) => {
  if (!ts) return "";
  try {
    // Add 8 hours to compensate for Singapore timezone (UTC+8)
    const date = new Date(ts);
    date.setHours(date.getHours() + 8);
    return format(date, "p");
  } catch {
    return "";
  }
};

const ReplyPreview = ({ replyTo }) => {
  if (!replyTo) return null;

  return (
    <div className="text-xs text-gray-500 bg-white/70 border border-gray-200 rounded-xl px-2 py-1 mb-1">
      <span className="font-semibold">
        {replyTo.sender?.username || "Someone"}:
      </span>{" "}
      <span className="italic">{replyTo.text || ""}</span>
    </div>
  );
};

const ChatMessage = ({ msg, currentUserId, onViewRestaurant }) => {
  const senderName = msg?.sender?.username || "Unknown";
  const isMe = Number(msg?.sender?.id) === Number(currentUserId);
  const time = formatMessageTime(msg?.created_at);

  const type = msg?.type;

  // ── Poll ──
  if (type === "poll")
    return (
      <div className="flex justify-center">
        <Poll poll={msg?.payload} />
      </div>
    );

  // ── Spin the Wheel ──
  if (type === "spin_wheel") {
    const session = msg?.payload;

    return (
      <div className="flex justify-center">
        <div className="chat-poll text-center">
          <p className="text-xs font-bold text-gray-500 mb-3">
            {senderName} started a spin
          </p>
          <SpinWheel
            options={session?.options || []}
            sessionId={session?.id}
            latestResult={session?.result}
          />
        </div>
      </div>
    );
  }

  // ── Food Suggestion ──
  if (type === "food_suggestion")
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[75%]">
          {!isMe && (
            <p className="text-xs text-gray-400 mb-1 ml-1">{senderName}</p>
          )}
          <FoodSuggestion message={msg} onViewRestaurant={onViewRestaurant} />
        </div>
      </div>
    );

  // ── Text message ──
  const text = msg?.is_deleted ? "[deleted]" : msg?.payload?.text || "";

  const bubbleClass = isMe
    ? "bg-[#F78660] text-white rounded-tr-sm"
    : "bg-white text-gray-800 rounded-tl-sm shadow-sm";

  const containerClass = useMemo(
    () => `max-w-[75%] ${isMe ? "" : "flex gap-2"}`,
    [isMe],
  );

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={containerClass}>
        {!isMe && <Avatar name={senderName} size="sm" />}
        <div>
          {!isMe && <p className="text-xs text-gray-400 mb-1">{senderName}</p>}
          <ReplyPreview replyTo={msg?.reply_to} />
          <div className={`px-3 py-2 rounded-2xl text-sm ${bubbleClass}`}>
            {text}
          </div>
          <p className="text-xs text-gray-300 mt-0.5 text-right">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
