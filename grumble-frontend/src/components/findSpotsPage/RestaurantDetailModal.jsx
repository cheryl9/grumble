import React, { useState } from "react";
import { ChevronLeft, Star } from "lucide-react";

const RestaurantDetailModal = ({ restaurant, onClose }) => {
  const outlets =
    restaurant.outlets?.length > 0
      ? restaurant.outlets
      : restaurant.location
        ? [restaurant.location]
        : [];

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
                  <p className="detail-value">
                    Outlet information not available
                  </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal;
