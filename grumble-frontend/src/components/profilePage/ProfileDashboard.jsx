import { Bell } from "lucide-react";

export default function ProfileDashboard({ stats, onViewAll }) {
  const cards = [
    {
      label: "Friends",
      value: stats?.friends ?? 0,
      key: "friends",
      icon: <Bell size={16} color="#2945A8" />,
    },
    { label: "My posts", value: stats?.posts ?? 0, key: "posts" },
    { label: "Liked", value: stats?.liked ?? 0, key: "liked" },
    { label: "Saved", value: stats?.saved ?? 0, key: "saved" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#FDDCB5",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.key}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {/* Label row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}
              >
                {card.label}
              </span>
              {card.icon && (
                <span style={{ fontSize: "16px" }}>{card.icon}</span>
              )}
            </div>

            {/* Count */}
            <span
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "#111",
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </span>

            {/* View all link */}
            <button
              onClick={() => onViewAll?.(card.key)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#2945A8",
                fontSize: "13px",
                textAlign: "left",
                textDecoration: "underline",
                marginTop: "4px",
              }}
            >
              View all →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
