import React from 'react';
import { X, MapPin, Star, Clock, DollarSign, Users, ChevronLeft, FileText } from 'lucide-react';

const RestaurantDetailModal = ({ restaurant, onClose }) => {
  const outlets = restaurant.outlets?.length > 0
    ? restaurant.outlets
    : (restaurant.location ? [restaurant.location] : []);

  // Mock friends data - will be replaced with real data later
  const mockFriends = [
    { userId: 1, username: 'Germaine', avatar: null },
    { userId: 2, username: 'Alice', avatar: null },
    { userId: 3, username: 'Wong Song', avatar: null },
    { userId: 4, username: 'Casey', avatar: null },
  ];

  // Use real friends data if available, otherwise use mock
  const friendsToDisplay = restaurant.friendsVisited?.length > 0 
    ? restaurant.friendsVisited 
    : mockFriends;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="restaurant-detail-container" onClick={(e) => e.stopPropagation()}>
        {/* Back Button */}
        <button onClick={onClose} className="back-button">
          <ChevronLeft size={24} />
        </button>

        {/* Two Column Layout */}
        <div className="restaurant-detail-grid">
          {/* Left Side - Image */}
          <div className="restaurant-detail-image-section">
            {restaurant.image ? (
              <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No image available
              </div>
            )}
          </div>

          {/* Right Side - Details with Yellow Background */}
          <div className="restaurant-detail-info-section">
            <h2 className="text-2xl font-bold mb-6">{restaurant.name}</h2>
            
            <div className="space-y-5">
              {/* Location */}
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

              {/* Opening Hours */}
              <div className="detail-item">
                <h3 className="detail-label">Opening Hours:</h3>
                <p className="detail-value">{restaurant.openingHours}</p>
              </div>

              {/* Price Range */}
              <div className="detail-item">
                <h3 className="detail-label">Price Range:</h3>
                <p className="detail-value">{restaurant.priceRange} per person</p>
              </div>

              {/* Ratings */}
              <div className="detail-item">
                <h3 className="detail-label">Ratings:</h3>
                <div className="flex items-center gap-1">
                  <span className="detail-value">{restaurant.rating ?? 'N/A'}</span>
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                </div>
              </div>

              {/* Menu */}
              <div className="detail-item">
                <h3 className="detail-label">Menu:</h3>
                <div className="detail-link flex items-center gap-2 text-gray-500">
                  <FileText size={16} />
                  Menu not available
                </div>
              </div>

              {/* Friends who have visited */}
              <div className="detail-item">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="detail-label mb-0">Friends who have visited before:</h3>
                  <span className="text-xs text-gray-500">View all unavailable</span>
                </div>
                <div className="friends-avatars">
                  {friendsToDisplay.slice(0, 4).map((friend, index) => (
                    <button
                      key={friend.userId}
                      className="friend-avatar"
                      onClick={() => {
                        // TODO: Navigate to friend's post
                        console.log(`View posts by ${friend.username}`);
                      }}
                      title={`@${friend.username}`}
                    >
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="avatar-placeholder">
                          <Users size={18} className="text-white" />
                        </div>
                      )}
                      <span className="friend-name">@{friend.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal;