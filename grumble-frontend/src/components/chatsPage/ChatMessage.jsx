import React from 'react';
import Avatar from './Avatar';
import Poll from './Poll';
import SpinWheel from './Spinwheel';
import FoodSuggestion from './FoodSuggestion';

const ChatMessage = ({ msg, onViewRestaurant }) => {
  const isMe = msg.sender === 'Me';

  // ── Poll ──
  if (msg.type === 'poll') return (
    <div className="flex justify-center">
      <Poll poll={msg} />
    </div>
  );

  // ── Spin the Wheel ──
  if (msg.type === 'spin-wheel') return (
    <div className="flex justify-center">
      <div className="chat-poll text-center">
        <p className="text-xs font-bold text-gray-500 mb-3">{msg.label}</p>
        <SpinWheel options={msg.options} />
      </div>
    </div>
  );

  // ── Food Suggestion ──
  if (msg.type === 'food-suggestion') return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        {!isMe && <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender}</p>}
        <FoodSuggestion msg={msg} onViewRestaurant={onViewRestaurant} />
      </div>
    </div>
  );

  // ── Text message ──
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isMe ? '' : 'flex gap-2'}`}>
        {!isMe && <Avatar name={msg.sender} size="sm" />}
        <div>
          {!isMe && <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>}
          <div className={`px-3 py-2 rounded-2xl text-sm ${
            isMe
              ? 'bg-[#F78660] text-white rounded-tr-sm'
              : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
          }`}>
            {msg.text}
          </div>
          <p className="text-xs text-gray-300 mt-0.5 text-right">{msg.time}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;