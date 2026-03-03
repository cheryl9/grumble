import React, { useState } from 'react';

const Poll = ({ poll }) => {
  const [voted,   setVoted]   = useState(null);
  const [options, setOptions] = useState(
    (poll.options || []).map(opt => ({ ...opt, votes: opt.votes ?? 0 }))
  );

  const total = options.reduce((s, o) => s + o.votes, 0);

  const vote = (id) => {
    if (voted) return;
    setVoted(id);
    setOptions(options.map(o => o.id === id ? { ...o, votes: o.votes + 1 } : o));
  };

  return (
    <div className="chat-poll">
      <p className="text-xs font-bold text-gray-500 mb-2">{poll.question}</p>
      <div className="space-y-2">
        {options.map(opt => {
          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
          return (
            <button key={opt.id} onClick={() => vote(opt.id)} className="w-full text-left">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs font-semibold ${voted === opt.id ? 'text-[#F78660]' : 'text-gray-700'}`}>
                  {opt.text}
                </span>
                {voted && <span className="text-xs text-gray-400">{opt.votes}</span>}
              </div>
              {voted && (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F78660] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {voted && (
        <p className="text-xs text-gray-400 mt-2 text-right cursor-pointer hover:text-[#F78660]">
          View votes
        </p>
      )}
    </div>
  );
};

export default Poll;