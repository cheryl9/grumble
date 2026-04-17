import React, { useEffect, useMemo, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import api from "../../services/api";

const FoodSuggestion = ({ message, onViewRestaurant }) => {
  const suggestion = message?.payload;
  const place = suggestion?.food_place;
  const suggestionId = suggestion?.id;

  const [likes, setLikes] = useState(suggestion?.likes ?? 0);
  const [dislikes, setDislikes] = useState(suggestion?.dislikes ?? 0);
  const [reaction, setReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(suggestion?.likes ?? 0);
    setDislikes(suggestion?.dislikes ?? 0);
    setReaction(null);
  }, [suggestionId]);

  const viewPayload = useMemo(() => {
    if (!place) return null;
    return {
      id: place.id,
      name: place.name,
      address: place.address,
      photo_url: place.photo_url,
    };
  }, [place]);

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
      className="chat-food-suggestion"
      onClick={() => viewPayload && onViewRestaurant(viewPayload)}
    >
      <div className="food-suggestion-image">
        {place.photo_url ? (
          <img
            src={place.photo_url}
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
        {place.address && (
          <p className="text-xs text-gray-400">{place.address}</p>
        )}

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
