import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import * as friendService from "../../services/friendService";

const FriendCard = ({ friend, onRemoved }) => {
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
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  return (
    <div className="friend-card">
      <div className="friend-card-content">
        {/* Avatar */}
        <div className="friend-card-avatar">
          {friend.friend_username?.charAt(0).toUpperCase() || "?"}
        </div>

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
