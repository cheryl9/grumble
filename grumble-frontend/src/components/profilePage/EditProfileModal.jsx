import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../../services/api";

export default function EditProfileModal({
  user,
  onClose,
  onSave,
  initialTab = "info",
}) {
  const [tab, setTab] = useState(initialTab); // 'info' | 'password' | 'preferences'
  const [username, setUsername] = useState(user?.username || "");
  const [phone_number, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hashtagCategories, setHashtagCategories] = useState({});
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [hashtagsRes, prefsRes] = await Promise.all([
          api.get("/auth/hashtags"),
          api.get("/auth/preferences"),
        ]);
        console.log("Hashtags response:", hashtagsRes.data);
        console.log("Preferences response:", prefsRes.data);

        // Handle both { data: {...} } and direct object responses
        const categories = hashtagsRes.data?.data || hashtagsRes.data || {};
        setHashtagCategories(categories);

        // Normalize hashtags by removing # prefix for consistent comparison
        const prefs = prefsRes.data?.data?.hashtag_preferences || [];
        const normalizedPrefs = prefs.map((tag) =>
          tag.startsWith("#") ? tag.substring(1) : tag,
        );
        setSelectedHashtags(normalizedPrefs);
      } catch (err) {
        console.error("Failed to load preferences:", err);
      }
    };
    loadPreferences();
  }, []);

  const handleHashtagToggle = (tag) => {
    setSelectedHashtags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((h) => h !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSavePreferences = async () => {
    setError("");
    setSuccess("");
    setPreferencesLoading(true);
    try {
      const response = await api.put("/auth/preferences", {
        hashtags: selectedHashtags,
      });
      if (response.data.success) {
        setSuccess("Preferences updated!");
      } else {
        setError(response.data.message || "Update failed.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Update failed.";
      setError(errorMessage);
    } finally {
      setPreferencesLoading(false);
    }
  };

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
      const errorMessage = err.response?.data?.message || "Update failed.";
      const errorField = err.response?.data?.field;

      // Provide more context in error message based on field
      if (errorField === "username") {
        setError(`Username: ${errorMessage}`);
      } else if (errorField === "phone_number") {
        setError(`Phone Number: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
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
      const errorMessage =
        err.response?.data?.message || "Failed to change password.";
      const errorField = err.response?.data?.field;

      // Provide more context in error message based on field
      if (errorField === "currentPassword") {
        setError(`Current Password: ${errorMessage}`);
      } else if (errorField === "newPassword") {
        setError(`New Password: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
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
          {["info", "password", "preferences"].map((t) => (
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
              {t === "info"
                ? "Account Info"
                : t === "password"
                  ? "Change Password"
                  : "Interests"}
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
        ) : tab === "password" ? (
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
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <p style={{ fontSize: "13px", color: "#666", margin: "0 0 8px 0" }}>
              Select your food interests and preferences:
            </p>
            <div
              style={{
                maxHeight: "350px",
                overflowY: "auto",
                paddingRight: "8px",
              }}
            >
              {Object.entries(hashtagCategories).length === 0 ? (
                <p style={{ fontSize: "12px", color: "#999" }}>
                  Loading interests...
                </p>
              ) : (
                Object.entries(hashtagCategories).map(([category, catData]) => {
                  // Handle nested structure { label, tags } or flat array
                  const tagsList = catData?.tags
                    ? catData.tags
                    : Array.isArray(catData)
                      ? catData
                      : [];
                  const label = catData?.label || category;

                  // Clean up hashtags (remove # if present)
                  const cleanedTags = tagsList.map((tag) =>
                    tag.startsWith("#") ? tag.substring(1) : tag,
                  );

                  return (
                    <div key={category} style={{ marginBottom: "16px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#999",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {cleanedTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleHashtagToggle(tag)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "20px",
                              border: selectedHashtags.includes(tag)
                                ? "2px solid #3B82F6"
                                : "1px solid #e5e7eb",
                              backgroundColor: selectedHashtags.includes(tag)
                                ? "#3B82F6"
                                : "#f9fafb",
                              color: selectedHashtags.includes(tag)
                                ? "#fff"
                                : "#555",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={preferencesLoading}
              style={primaryBtnStyle}
            >
              {preferencesLoading ? "Updating..." : "Update Preferences"}
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
