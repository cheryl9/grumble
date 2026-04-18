import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import api from "../../services/api";
import { getFoodPlaceById } from "../../services/foodPlacesService";

const FoodSuggestion = ({ message, onViewRestaurant }) => {
  const suggestion = message?.payload;
  const place = suggestion?.food_place;
  const suggestionId = suggestion?.id;

  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const [placeDetails, setPlaceDetails] = useState(null);
  const [detailsLoaded, setDetailsLoaded] = useState(false);

  const [likes, setLikes] = useState(suggestion?.likes ?? 0);
  const [dislikes, setDislikes] = useState(suggestion?.dislikes ?? 0);
  const [reaction, setReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(suggestion?.likes ?? 0);
    setDislikes(suggestion?.dislikes ?? 0);
    setReaction(null);
  }, [suggestionId, suggestion?.likes, suggestion?.dislikes]);

  useEffect(() => {
    setPlaceDetails(null);
    setDetailsLoaded(false);
  }, [place?.id]);

  useEffect(() => {
    if (!cardRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchDetails = async () => {
      const placeId = Number(place?.id);
      if (!Number.isInteger(placeId)) {
        setPlaceDetails(null);
        setDetailsLoaded(false);
        return;
      }

      if (!isVisible || detailsLoaded) return;

      try {
        const details = await getFoodPlaceById(placeId);
        if (!isActive) return;
        setPlaceDetails(details);
        setDetailsLoaded(true);
      } catch {
        if (!isActive) return;
        setPlaceDetails(null);
        setDetailsLoaded(true);
      }
    };

    fetchDetails();

    return () => {
      isActive = false;
    };
  }, [place?.id, isVisible, detailsLoaded]);

  const rating =
    placeDetails?.google?.rating ??
    (typeof placeDetails?.rating === "number" ? placeDetails.rating : null);
  const location =
    placeDetails?.google?.address ||
    placeDetails?.address ||
    place?.address ||
    "Address unavailable";

  const imageUrl =
    placeDetails?.google?.image ||
    placeDetails?.image_url ||
    placeDetails?.imageUrl ||
    null;

  const viewPayload = useMemo(() => {
    if (!place) return null;
    return {
      id: place.id,
      name: place.name,
      address: location,
      photo_url: imageUrl,
    };
  }, [place, location, imageUrl]);

  const react = async (type) => {
    if (!suggestionId || loading) return;

    try {
      setLoading(true);

      const res = await api.post(`/suggestions/${suggestionId}/react`, {
        reaction: type,
      });

      const data = res.data?.data;
      const updated = data?.suggestion;

      if (typeof updated?.likes === "number") setLikes(updated.likes);
      if (typeof updated?.dislikes === "number") setDislikes(updated.dislikes);
      setReaction(data?.your_reaction ?? null);
    } catch {
      // Keep UI state as-is on failure.
    } finally {
      setLoading(false);
    }
  };

  if (!suggestion || !place) return null;

  return (
    <div
      ref={cardRef}
      className="chat-food-suggestion"
      onClick={() => viewPayload && onViewRestaurant(viewPayload)}
    >
      <div className="food-suggestion-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#FCF1DD] flex items-center justify-center text-3xl">
            🍽️
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-400 font-semibold mb-0.5">
          {message?.sender?.username || "Someone"} suggested:
        </p>
        <p className="font-bold text-gray-900 text-base">{place.name}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
          <div className="flex items-center gap-1 min-w-0">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="truncate">
              {rating != null ? Number(rating).toFixed(1) : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <MapPin size={14} className="text-red-500" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => react("like")}
            disabled={loading}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-60 ${
              reaction === "like"
                ? "bg-[#F78660] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-[#FCF1DD]"
            }`}
          >
            <ThumbsUp size={12} /> {likes}
          </button>
          <button
            onClick={() => react("dislike")}
            disabled={loading}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-60 ${
              reaction === "dislike"
                ? "bg-[#2945A8] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-blue-50"
            }`}
          >
            <ThumbsDown size={12} /> {dislikes}
          </button>
        </div>

      </div>
    </div>
  );
};

export default FoodSuggestion;
