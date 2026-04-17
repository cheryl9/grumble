import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const Poll = ({ poll }) => {
  const pollId = poll?.id;

  const [voted, setVoted] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setVoted(null);
    setOptions(
      (poll?.options || []).map((opt) => ({ ...opt, votes: opt.votes ?? 0 })),
    );
    setError(null);
  }, [pollId]);

  const total = useMemo(
    () => options.reduce((s, o) => s + (o.votes || 0), 0),
    [options],
  );

  const castVote = async (optionId) => {
    if (!pollId || !optionId || loading) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.post(`/polls/${pollId}/vote`, {
        option_id: optionId,
      });
      const updated = res.data?.data;

      if (updated?.options) setOptions(updated.options);
      setVoted(res.data?.user_vote?.option_id ?? optionId);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to vote",
      );
    } finally {
      setLoading(false);
    }
  };

  const removeVote = async () => {
    if (!pollId || loading) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.delete(`/polls/${pollId}/vote`);
      const updated = res.data?.data;

      if (updated?.options) setOptions(updated.options);
      setVoted(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to remove vote",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!poll) return null;

  return (
    <div className="chat-poll">
      <p className="text-xs font-bold text-gray-500 mb-2">{poll.question}</p>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="space-y-2">
        {options.map((opt) => {
          const pct =
            total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
          const isSelected = voted === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => castVote(opt.id)}
              className="w-full text-left disabled:opacity-60"
              disabled={loading}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? "text-[#F78660]" : "text-gray-700"
                  }`}
                >
                  {opt.text}
                </span>
                {voted && (
                  <span className="text-xs text-gray-400">
                    {opt.votes || 0}
                  </span>
                )}
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
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={removeVote}
            className="text-xs text-gray-400 hover:text-[#F78660]"
            disabled={loading}
          >
            Remove vote
          </button>
        </div>
      )}
    </div>
  );
};

export default Poll;
