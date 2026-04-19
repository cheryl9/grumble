import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Star, Users } from 'lucide-react';
import RestaurantDetailModal from './RestaurantDetailModal';
import UserAvatar from '../common/UserAvatar';
import { getFriendsVisitedByRestaurantId } from '../../services/friendsVisitedService';

const RestaurantCard = ({ restaurant }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [friendsVisited, setFriendsVisited] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isFriendsLoaded, setIsFriendsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: '200px' },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchFriendsVisited = async () => {
      if (!restaurant?.id) {
        setFriendsVisited([]);
        setIsFriendsLoaded(false);
        return;
      }

      if (!isVisible || isFriendsLoaded) {
        return;
      }

      setIsLoadingFriends(true);
      try {
        const friends = await getFriendsVisitedByRestaurantId(restaurant.id);
        if (!isActive) return;
        setFriendsVisited(friends);
        setIsFriendsLoaded(true);
      } catch (error) {
        if (!isActive) return;
        console.error('Failed to fetch friends who visited restaurant:', error);
        setFriendsVisited([]);
      } finally {
        if (isActive) {
          setIsLoadingFriends(false);
        }
      }
    };

    fetchFriendsVisited();

    return () => {
      isActive = false;
    };
  }, [restaurant?.id, isVisible, isFriendsLoaded]);

  return (
    <>
      <div
        ref={cardRef}
        className="restaurant-card"
        onClick={() => setShowDetail(true)}
      >
        <div className="restaurant-image">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
              No image
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span>{restaurant.rating ?? 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-red-500" />
              <span>{restaurant.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{restaurant.cuisine}</span>
            <span className="font-medium text-[#F78660]">{restaurant.priceRange}</span>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Friends visited
              </span>
              {friendsVisited.length > 4 && (
                <span className="text-xs text-[#2945A8]">{friendsVisited.length} friends</span>
              )}
            </div>

            {isLoadingFriends ? (
              <div className="text-xs text-gray-400">Checking visits...</div>
            ) : friendsVisited.length > 0 ? (
              <div className="friends-visited-row">
                <div className="friends-visited-stack">
                  {friendsVisited.slice(0, 4).map((friend) => (
                    <UserAvatar
                      key={friend.id}
                      className="friends-visited-chip"
                      avatarUrl={friend.avatar_url}
                      equippedAvatar={friend.equipped_avatar}
                      size={34}
                    />
                  ))}
                </div>

                <span className="friends-visited-label">
                  {friendsVisited.length === 1
                    ? `@${friendsVisited[0].username}`
                    : `${friendsVisited.length} friends visited`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users size={14} />
                <span>No friend visits yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetail && (
        <RestaurantDetailModal
          restaurant={restaurant}
          initialFriendsVisited={friendsVisited}
          initialLoaded={isFriendsLoaded}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default RestaurantCard;