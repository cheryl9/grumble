import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Clock, UserCheck } from "lucide-react";
import * as friendService from "../../services/friendService";

const AddFriendSearch = ({
  sentRequests = [],
  friends = [],
  onRequestSent,
  isTopBar = false,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingRequestIds, setSendingRequestIds] = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);
  const dropdownRef = useRef(null);

  // Convert sent requests and friends to maps for fast lookup
  const sentRequestMap = new Map(sentRequests.map((r) => [r.recipient_id, r]));
  const friendsMap = new Map(friends.map((f) => [f.friend_user_id, f]));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await friendService.searchUsers(query);
        setResults(data || []);
        setError(null);
      } catch (err) {
        console.error("Error searching users:", err);
        setError("Failed to search users");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [query]);

  const handleAddFriend = async (userId) => {
    setSendingRequestIds(new Set(sendingRequestIds).add(userId));
    try {
      await friendService.sendFriendRequest(userId);
      // Clear the search and notify parent to refetch
      setQuery("");
      setShowDropdown(false);
      onRequestSent?.();
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError("Failed to send friend request");
    } finally {
      setSendingRequestIds((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  };

  const getButtonState = (user) => {
    if (sendingRequestIds.has(user.id)) {
      return { text: "Sending...", disabled: true, icon: null };
    }
    if (friendsMap.has(user.id)) {
      return {
        text: "Already Friends",
        disabled: true,
        icon: <UserCheck size={16} />,
      };
    }
    if (sentRequestMap.has(user.id)) {
      return { text: "Pending", disabled: true, icon: <Clock size={16} /> };
    }
    return { text: "Add Friend", disabled: false, icon: <Plus size={16} /> };
  };

  if (isTopBar) {
    return (
      <div className="friends-search-wrapper" ref={dropdownRef}>
        <div className="friends-search-bar-container">
          <Search className="friends-search-icon" size={20} />
          <input
            type="text"
            placeholder="Find friends..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
            className="friends-search-input"
          />
          {isLoading && (
            <div className="friends-search-loading">
              <div className="animate-spin">
                <Search size={20} />
              </div>
            </div>
          )}
        </div>

        {error && <div className="friends-search-error">{error}</div>}

        {showDropdown && results.length > 0 && (
          <div className="friends-search-dropdown">
            {results.map((user) => {
              const button = getButtonState(user);
              return (
                <div key={user.id} className="friends-search-result">
                  <div className="friends-search-result-user">
                    <div className="friends-search-result-avatar">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <p className="friends-search-result-username">
                      {user.username}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddFriend(user.id)}
                    disabled={button.disabled}
                    className={`friends-search-result-btn ${
                      button.disabled
                        ? "friends-search-result-btn-disabled"
                        : "friends-search-result-btn-active"
                    }`}
                  >
                    {button.icon}
                    {button.text}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {query && results.length === 0 && !isLoading && showDropdown && (
          <div className="friends-search-empty">
            <p>No users found matching "{query}"</p>
          </div>
        )}
      </div>
    );
  }

  // Original layout for non-top-bar usage
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search users by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin text-gray-400">
              <Search size={20} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
          {results.map((user) => {
            const button = getButtonState(user);
            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{user.username}</p>
                </div>

                <button
                  onClick={() => handleAddFriend(user.id)}
                  disabled={button.disabled}
                  className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition flex-shrink-0 ${
                    button.disabled
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {button.icon}
                  {button.text}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {query && results.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p>No users found matching "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default AddFriendSearch;
