import React, { useState, useEffect } from "react";
import { Users, AlertCircle } from "lucide-react";
import FriendCard from "../components/friendsPage/FriendCard";
import FriendRequestCard from "../components/friendsPage/FriendRequestCard";
import AddFriendSearch from "../components/friendsPage/AddFriendSearch";
import * as friendService from "../services/friendService";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarRefreshToken, setAvatarRefreshToken] = useState(0);

  // Fetch friends and requests on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [friendsData, requestsData, sentData] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests(),
        friendService.getSentRequests(),
      ]);
      setFriends(friendsData || []);
      setRequests(requestsData || []);
      setSentRequests(sentData || []);
      // Forces avatar <img> reload if friends overwrite an existing avatar URL.
      setAvatarRefreshToken(Date.now());
    } catch (err) {
      console.error("Error fetching friends data:", err);
      setError("Failed to load friends data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoved = (friendshipId) => {
    // Remove from friends list without reloading
    setFriends((prev) => prev.filter((f) => f.friendship_id !== friendshipId));
  };

  const handleAccepted = (friendshipId) => {
    // Move from requests to friends without reloading
    const accepted = requests.find((r) => r.friendship_id === friendshipId);
    if (accepted) {
      setRequests((prev) =>
        prev.filter((r) => r.friendship_id !== friendshipId),
      );
      setFriends((prev) => [...prev, accepted]);
    }
  };

  const handleDeclined = (friendshipId) => {
    // Remove from requests without reloading
    setRequests((prev) => prev.filter((r) => r.friendship_id !== friendshipId));
  };

  return (
    <div className="friends-page-container">
      <div className="friends-page-content">
        {/* Search Bar */}
        <div className="friends-search-section">
          <AddFriendSearch
            sentRequests={sentRequests}
            friends={friends}
            onRequestSent={(newRequest) => {
              // Add to sent requests without reloading
              setSentRequests((prev) => [...prev, newRequest]);
            }}
            isTopBar={true}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="friends-error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="friends-loading-state">
            <div className="inline-block animate-spin text-[#F78660]">
              <Users size={32} />
            </div>
            <p className="text-gray-500 mt-4">Loading friends...</p>
          </div>
        ) : (
          <>
            {/* Pending Requests Section */}
            {requests.length > 0 && (
              <div className="friends-section">
                <h2 className="friends-section-title">
                  Friend Requests ({requests.length})
                </h2>
                <div className="friends-request-grid">
                  {requests.map((request) => (
                    <FriendRequestCard
                      key={request.friendship_id}
                      request={request}
                      onAccepted={handleAccepted}
                      onDeclined={handleDeclined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Friends List Section */}
            <div className="friends-section">
              <h2 className="friends-section-title">
                My Friends ({friends.length})
              </h2>
              {friends.length === 0 ? (
                <div className="friends-empty-state">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No friends yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Use the search bar above to find and connect with friends!
                  </p>
                </div>
              ) : (
                <div className="friends-grid">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.friendship_id}
                      friend={friend}
                      avatarCacheKey={avatarRefreshToken}
                      onRemoved={handleRemoved}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
