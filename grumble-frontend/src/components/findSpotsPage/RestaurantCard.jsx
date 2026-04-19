import React, { useState } from "react";
import { MapPin, Star } from "lucide-react";
import RestaurantDetailModal from "./RestaurantDetailModal";

const RestaurantCard = ({ restaurant }) => {
  const [showDetail, setShowDetail] = useState(false);
  const cardRef = useRef(null);

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
              <span>{restaurant.rating ?? "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-red-500" />
              <span>{restaurant.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{restaurant.cuisine}</span>
            <span className="font-medium text-[#F78660]">
              {restaurant.priceRange}
            </span>
          </div>
        </div>
      </div>

      {showDetail && (
        <RestaurantDetailModal
          restaurant={restaurant}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default RestaurantCard;
