import React, { useState } from "react";
import { Check, X } from "lucide-react";
import * as friendService from "../../services/friendService";

const FriendRequestCard = ({ request, onAccepted, onDeclined }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await friendService.acceptFriendRequest(request.friendship_id);
      onAccepted?.(request.friendship_id);
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError("Failed to accept request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await friendService.declineFriendRequest(request.friendship_id);
      onDeclined?.(request.friendship_id);
    } catch (err) {
      console.error("Error declining friend request:", err);
      setError("Failed to decline request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="friend-request-card">
      <div className="friend-request-content">
        <div className="friend-avatar-section">
          <div className="friend-avatar">
            {request.requester_username?.charAt(0).toUpperCase() || "?"}
          </div>
        </div>
        <div className="friend-info">
          <p className="friend-name">{request.requester_username}</p>
        </div>
      </div>

      <div className="friend-request-actions">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="friend-request-btn friend-request-accept"
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="friend-request-btn friend-request-decline"
        >
          Decline
        </button>
      </div>

      {error && <div className="friend-card-error">{error}</div>}
    </div>
  );
};

export default FriendRequestCard;
