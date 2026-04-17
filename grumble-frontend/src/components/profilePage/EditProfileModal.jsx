import { useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";

export default function EditProfileModal({
  user,
  onClose,
  onSave,
  initialTab = "info",
}) {
  const [tab, setTab] = useState(initialTab); // 'info' | 'password'
  const [username, setUsername] = useState(user?.username || "");
  const [phone_number, setPhoneNumber] = useState(user?.phone_number || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSaveInfo = async () => {
    setError("");
    setSuccess("");
    if (!username.trim()) return setError("Username cannot be empty.");
    if (!phone_number.trim()) return setError("Phone number cannot be empty.");

    setLoading(true);
    try {
      const response = await api.put("/auth/profile", {
        username,
        phone_number,
      });
      if (response.data.success) {
        setSuccess("Profile updated!");
        onSave?.(response.data.data.user);
      } else {
        setError(response.data.message || "Update failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword)
      return setError("All fields are required.");
    if (newPassword !== confirmPassword)
      return setError("New passwords do not match.");
    if (newPassword.length < 6)
      return setError("New password must be at least 6 characters.");

    setLoading(true);
    try {
      const response = await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      if (response.data.success) {
        setSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.data.message || "Failed to change password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Close */}
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
            marginBottom: "20px",
            color: "#111",
          }}
        >
          Edit Profile
        </h2>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["info", "password"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
                setSuccess("");
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                backgroundColor: tab === t ? "#F78660" : "#f3f4f6",
                color: tab === t ? "#fff" : "#555",
                transition: "all 0.15s",
              }}
            >
              {t === "info" ? "Account Info" : "Change Password"}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            {success}
          </div>
        )}

        {tab === "info" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Field label="Username" value={username} onChange={setUsername} />
            <Field
              label="Phone Number"
              value={phone_number}
              onChange={setPhoneNumber}
              type="tel"
            />
            <button
              onClick={handleSaveInfo}
              disabled={loading}
              style={primaryBtnStyle}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Field
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              type="password"
            />
            <Field
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              type="password"
            />
            <Field
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              style={primaryBtnStyle}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#555",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#F78660")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

const primaryBtnStyle = {
  backgroundColor: "#F78660",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "12px",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  width: "100%",
  marginTop: "4px",
  transition: "background 0.15s",
};
