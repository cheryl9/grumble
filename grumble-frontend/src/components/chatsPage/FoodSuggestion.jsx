import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const FoodSuggestion = ({ msg, onViewRestaurant }) => {
  const [likes,    setLikes]    = useState(msg.likes ?? 0);
  const [dislikes, setDislikes] = useState(msg.dislikes ?? 0);
  const [reaction, setReaction] = useState(null);

  const react = (type) => {
    if (reaction === type) return;
    if (type === 'like') {
      setLikes(l => l + 1);
      if (reaction === 'dislike') setDislikes(d => d - 1);
    }
    if (type === 'dislike') {
      setDislikes(d => d + 1);
      if (reaction === 'like') setLikes(l => l - 1);
    }
    setReaction(type);
  };

  return (
    <div className="chat-food-suggestion" onClick={() => onViewRestaurant(msg.restaurant)}>
      {/* Image */}
      <div className="food-suggestion-image">
        {msg.restaurant.image
          ? <img src={msg.restaurant.image} alt={msg.restaurant.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#FCF1DD] flex items-center justify-center text-3xl">🍽️</div>
        }
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 font-semibold mb-0.5">{msg.sender} suggested:</p>
        <p className="font-bold text-gray-900 text-base">{msg.restaurant.name}</p>
        <p className="text-xs text-gray-400">{msg.restaurant.cuisine}</p>

        {/* Like / Dislike */}
        <div className="flex gap-3 mt-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => react('like')}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              reaction === 'like'
                ? 'bg-[#F78660] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-[#FCF1DD]'
            }`}
          >
            <ThumbsUp size={12} /> {likes}
          </button>
          <button
            onClick={() => react('dislike')}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              reaction === 'dislike'
                ? 'bg-[#2945A8] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-blue-50'
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