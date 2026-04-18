import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  FileText,
  Star,
} from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import { getFriendsVisitedByRestaurantId } from "../../services/friendsVisitedService";

const RestaurantDetailModal = ({
  restaurant,
  onClose,
  initialFriendsVisited = [],
  initialLoaded = false,
}) => {
  const outlets =
    restaurant.outlets?.length > 0
      ? restaurant.outlets
      : restaurant.location
        ? [restaurant.location]
        : [];

  const [friendsVisited, setFriendsVisited] = useState(initialFriendsVisited);
  const [isLoading, setIsLoading] = useState(!initialLoaded);

  useEffect(() => {
    let isActive = true;

    const fetchFriendsWhoVisited = async () => {
      if (!restaurant?.id) {
        if (isActive) setIsLoading(false);
        return;
      }

      if (initialLoaded) {
        if (isActive) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const friends = await getFriendsVisitedByRestaurantId(restaurant.id);
        if (!isActive) return;
        setFriendsVisited(friends);
      } catch (error) {
        if (!isActive) return;
        console.error("Failed to fetch friends who visited:", error);
        setFriendsVisited([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchFriendsWhoVisited();

    return () => {
      isActive = false;
    };
  }, [restaurant?.id, initialLoaded]);

  const openingHoursText = restaurant.openingHours || "Not available";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="restaurant-detail-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="back-button">
          <ChevronLeft size={24} />
        </button>

        <div className="restaurant-detail-grid">
          <div className="restaurant-detail-image-section">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No image available
              </div>
            )}
          </div>

          <div className="restaurant-detail-info-section">
            <h2 className="text-2xl font-bold mb-6">{restaurant.name}</h2>

            <div className="space-y-5">
              <div className="detail-item">
                <h3 className="detail-label">Location:</h3>
                {outlets.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {outlets.map((outlet, idx) => (
                      <li key={`${outlet}-${idx}`}>{outlet}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="detail-value">Outlet information not available</p>
                )}
              </div>

              <div className="detail-item">
                <h3 className="detail-label">Opening Hours:</h3>
                <p className="detail-value text-sm text-gray-700">
                  {openingHoursText}
                </p>
              </div>

              <div className="detail-item">
                <h3 className="detail-label">Price Range:</h3>
                <p className="detail-value text-sm text-gray-700">
                  {restaurant.priceRange || "-"}
                </p>
              </div>

              <div className="detail-item">
                <h3 className="detail-label">Ratings:</h3>
                <div className="flex items-center gap-1">
                  <span className="detail-value">
                    {restaurant.rating ?? "N/A"}
                  </span>
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                </div>
              </div>

              <div className="detail-item">
                <h3 className="detail-label">Menu:</h3>
                <div className="detail-link flex items-center gap-2 text-gray-500">
                  <FileText size={16} />
                  Menu not available
                </div>
              </div>

              <div className="detail-item">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="detail-label mb-0">Friends who have visited:</h3>
                  {friendsVisited.length > 4 && (
                    <span className="text-xs text-[#2945A8] cursor-pointer">
                      View all ({friendsVisited.length})
                    </span>
                  )}
                </div>

                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading friends data...</p>
                ) : friendsVisited.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No friends have posted from this location yet
                  </p>
                ) : (
                  <div className="friends-visited-modal-grid">
                    {friendsVisited.slice(0, 4).map((friend) => (
                      <div key={friend.id} className="friends-visited-modal-item" title={`@${friend.username}`}>
                        <UserAvatar
                          avatarUrl={friend.avatar_url}
                          equippedAvatar={friend.equipped_avatar}
                          size={40}
                        />
                        <span className="friends-visited-handle">@{friend.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal;
