import { useState } from "react";
import { X } from "lucide-react";
import { ACHIEVEMENT_CATALOG } from "../../utils/achievementCatalog";
import AvatarPickerModal from "../profilePage/AvatarPickerModal";

const ACHIEVEMENTS = ACHIEVEMENT_CATALOG;

export default function AllAchievementsModal({
  unlockedKeys = [],
  equippedAvatar = null,
  onClose,
  onAvatarEquip,
  onAvatarUnequip,
}) {
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "#8b7355";
      case "rare":
        return "#4169e1";
      case "epic":
        return "#8b2e8b";
      default:
        return "#999";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 2000,
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "85vh",
          padding: "0",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#111",
              margin: 0,
            }}
          >
            All Achievements
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} color="#666" />
          </button>
        </div>

        {/* Achievements Grid */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedKeys.includes(achievement.key);
            return (
              <div
                key={achievement.key}
                onClick={() => isUnlocked && setSelectedAchievement(achievement)}
                style={{
                  backgroundColor: isUnlocked ? "#fff" : "#f5f5f5",
                  border: isUnlocked
                    ? `2px solid ${getRarityColor(achievement.rarity)}`
                    : "1px solid #e5e5e5",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  textAlign: "center",
                  cursor: isUnlocked ? "pointer" : "default",
                  opacity: isUnlocked ? 1 : 0.6,
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (isUnlocked) {
                    e.currentTarget.style.backgroundColor = "#FCF1DD";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isUnlocked) {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                {/* Badge indicator */}
                {isUnlocked && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#166534",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* Image */}
                <img
                  src={achievement.image}
                  alt={achievement.label}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* Name */}
                <div
                  style={{ fontSize: "12px", fontWeight: "600", color: "#111" }}
                >
                  {achievement.label}
                </div>

                {/* Rarity */}
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: getRarityColor(achievement.rarity),
                    textTransform: "uppercase",
                  }}
                >
                  {achievement.rarity.toUpperCase()}
                </div>

                {/* Description */}
                <div
                  style={{ fontSize: "10px", color: "#666", lineHeight: "1.2" }}
                >
                  {achievement.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedAchievement && (
        <AvatarPickerModal
          achievement={selectedAchievement}
          isCurrentlyEquipped={equippedAvatar === selectedAchievement.key}
          onEquip={async (key) => {
            await onAvatarEquip?.(key);
            setSelectedAchievement(null);
            onClose?.();
          }}
          onUnequip={async () => {
            await onAvatarUnequip?.();
            setSelectedAchievement(null);
            onClose?.();
          }}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}
