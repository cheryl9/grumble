import { useState, useEffect } from "react";
import { X, UserPlus, UserCheck } from "lucide-react";
import { getFriends, getFriendRequests } from "../../services/friendService";
import UserAvatar from "./UserAvatar";

export default function FriendsModal({ onClose }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);
      setFriends(friendsData || []);
      setPendingRequests(requestsData?.length || 0);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800">Friends</h2>
            {pendingRequests > 0 && (
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {pendingRequests}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400">Loading friends...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!loading && friends.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400">No friends yet</p>
            </div>
          )}

          {!loading && friends.length > 0 && (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <UserAvatar
                    equippedAvatar={friend.equipped_avatar}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {friend.username}
                    </p>
                    {friend.friendshipId && (
                      <p className="text-xs text-gray-500">
                        Friends since{" "}
                        {new Date(friend.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <UserCheck
                    size={18}
                    className="text-green-500 flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
