import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import * as friendService from "../../services/friendService";
import UserAvatar from "../common/UserAvatar";

const FriendCard = ({ friend, onRemoved, avatarCacheKey = null }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState(null);

  const handleRemove = async () => {
    setIsRemoving(true);
    setError(null);
    try {
      await friendService.removeFriend(friend.friendship_id);
      onRemoved?.(friend.friendship_id);
    } catch (err) {
      console.error("Error removing friend:", err);
      setError("Failed to remove friend");
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "--/--";

    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Singapore",
    }).format(date);
  };

  return (
    <div className="friend-card">
      <div className="friend-card-content">
        {/* Avatar */}
        <UserAvatar
          avatarUrl={friend.avatar_url}
          equippedAvatar={friend.equipped_avatar}
          cacheKey={avatarCacheKey}
          size={60}
          className="flex-shrink-0"
        />

        {/* Info */}
        <div className="friend-card-info">
          <h3 className="friend-card-name">{friend.friend_username}</h3>
          <p className="friend-card-date">
            Friends since {formatDate(friend.created_at)}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="friend-card-btn friend-card-remove-btn"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      </div>

      {error && <div className="friend-card-error">{error}</div>}
    </div>
  );
};

export default FriendCard;
