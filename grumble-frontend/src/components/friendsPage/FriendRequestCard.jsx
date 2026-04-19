import React, { useState } from "react";
import { Check, X } from "lucide-react";
import * as friendService from "../../services/friendService";
import UserAvatar from "../common/UserAvatar";
import { useToast } from "../../context/ToastContext";
import { buildLocalActionToast } from "../../utils/toastBuilders";

const FriendRequestCard = ({ request, onAccepted, onDeclined }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { pushToast } = useToast();

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await friendService.acceptFriendRequest(request.friendship_id);
      pushToast(
        buildLocalActionToast(
          "friend_request_accepted",
          "Friend request accepted!",
        ),
      );
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
      pushToast(
        buildLocalActionToast(
          "friend_request_declined",
          "Friend request declined.",
        ),
      );
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
        <UserAvatar
          equippedAvatar={request.equipped_avatar}
          size={48}
          className="flex-shrink-0"
        />
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
