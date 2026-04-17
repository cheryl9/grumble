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
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "24px",
        width: "100%",
        maxWidth: "360px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        fontFamily: "inherit",
      }}
    >
      {/* Title */}
      <p
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#1a1a1a",
          marginBottom: "16px",
        }}
      >
        {poll.question}
      </p>

      {error && (
        <p style={{ fontSize: "12px", color: "#dc2626", marginBottom: "8px" }}>
          {error}
        </p>
      )}

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {options.map((opt) => {
          const pct =
            total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
          const isSelected = voted === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => (isSelected ? null : castVote(opt.id))}
              disabled={loading}
              style={{
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: isSelected
                  ? "1.5px solid #F78660"
                  : "1.5px solid #e5e7eb",
                borderRadius: "10px",
                padding: "10px 14px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "border-color 0.2s",
              }}
            >
              {/* Row: radio + label + pct */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Radio circle */}
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: isSelected
                        ? "2px solid #F78660"
                        : "2px solid #d1d5db",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "border-color 0.2s",
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          backgroundColor: "#F78660",
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isSelected ? "600" : "500",
                      color: isSelected ? "#F78660" : "#374151",
                      transition: "color 0.2s",
                    }}
                  >
                    {opt.text}
                  </span>
                </div>

                {/* Percentage */}
                {voted && (
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                    }}
                  >
                    {pct}%
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {voted && (
                <div
                  style={{
                    height: "5px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      backgroundColor: isSelected ? "#F78660" : "#d1d5db",
                      borderRadius: "999px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Remove vote */}
      {voted && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            type="button"
            onClick={removeVote}
            disabled={loading}
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F78660")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            Remove vote
          </button>
        </div>
      )}
    </div>
  );
};

export default Poll;