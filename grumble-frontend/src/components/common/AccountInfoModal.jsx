import { X } from "lucide-react";

export default function AccountInfoModal({ user, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "460px",
          padding: "24px",
          position: "relative",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={20} color="#666" />
        </button>

        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#111",
          }}
        >
          Account Information
        </h2>

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Username */}
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#666",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Username
            </label>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "14px",
                color: "#111",
              }}
            >
              {user?.username || "N/A"}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#666",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Phone Number (Optional)
            </label>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "14px",
                color: "#111",
              }}
            >
              {user?.phoneNumber || "Not set"}
            </div>
          </div>
        </div>

        {/* Close button at bottom */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "10px 16px",
            backgroundColor: "#F78660",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
