import { useState } from "react";
import AvatarPickerModal from "./AvatarPickerModal";

export const ALL_ACHIEVEMENTS = [
  {
    key: "tiny_tummy",
    label: "Tiny Tummy",
    description: "Post your very first Grumble restaurant review.",
    avatarFile: "tiny_tummy.png",
    rarity: "common",
  },
  {
    key: "gut_guardian",
    label: "Gut Guardian",
    description: "Post restaurant reviews for 7 days in a row.",
    avatarFile: "gut_guardian.png",
    rarity: "common",
  },
  {
    key: "digestive_dynamo",
    label: "Digestive Dynamo",
    description: "Maintain a 14-day Grumble streak.",
    avatarFile: "digestive_dynamo.png",
    rarity: "common",
  },
  {
    key: "golden_kidney",
    label: "Golden Kidney",
    description: "Visit and post at 10 different cafés.",
    avatarFile: "golden_kidney.png",
    rarity: "common",
  },
  {
    key: "bean_there_done_that",
    label: "Bean There, Done That",
    description: "Visit and post at the same restaurant as your friend",
    avatarFile: "bean_there_done_that.png",
    rarity: "common",
  },
  {
    key: "snack_goblin",
    label: "Snack Goblin",
    description: "Review 15 dessert spots",
    avatarFile: "snack_goblin.png",
    rarity: "rare",
  },
  {
    key: "liver_it_up",
    label: "Liver It Up",
    description: "Post your first late-night supper spot after 12am.",
    avatarFile: "liver_it_up.png",
    rarity: "rare",
  },
  {
    key: "kidney_bean",
    label: "Kidney Bean",
    description: "Review 10 drink stores",
    avatarFile: "kidney_bean.png",
    rarity: "rare",
  },
  {
    key: "heart_of_the_feast",
    label: "Heart of the Feast",
    description: "Share reviews for 50 dining restaurants.",
    avatarFile: "heart_of_the_feast.png",
    rarity: "epic",
  },
  {
    key: "open_stomach_policy",
    label: "Open Stomach Policy",
    description: "Post 10 reviews",
    avatarFile: "open_stomach_policy.png",
    rarity: "epic",
  },
  {
    key: "kidney_crew",
    label: "Kidney Crew",
    description: "Make 10 friends on Grumble",
    avatarFile: "kidney_crew.png",
    rarity: "epic",
  },
];

function RarityBadge({ rarity, color }) {
  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: "4px",
        padding: "1px 5px",
      }}
    >
      {rarity}
    </span>
  );
}

function AchievementCard({ achievement, isUnlocked, isEquipped, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={isUnlocked ? onClick : undefined}
      title={
        isUnlocked ? achievement.description : `🔒 ${achievement.description}`
      }
      style={{
        backgroundColor: "#fff",
        borderRadius: "14px",
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        boxShadow: isEquipped
          ? "0 0 0 2.5px #F78660, 0 2px 8px rgba(247,134,96,0.25)"
          : "0 1px 4px rgba(0,0,0,0.07)",
        opacity: isUnlocked ? 1 : 0.42,
        filter: isUnlocked ? "none" : "grayscale(70%)",
        cursor: isUnlocked ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (isUnlocked) {
          e.currentTarget.style.transform = "translateY(-2px)";
          if (!isEquipped)
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isEquipped
          ? "0 0 0 2.5px #F78660, 0 2px 8px rgba(247,134,96,0.25)"
          : "0 1px 4px rgba(0,0,0,0.07)";
      }}
    >
      {/* Equipped crown badge */}
      {isEquipped && (
        <div
          style={{
            position: "absolute",
            top: "-7px",
            right: "-7px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#F78660",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          ✓
        </div>
      )}

      {/* Icon circle */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {!imgError ? (
          <img
            src={`/src/assets/avatars/${achievement.avatarFile}`}
            alt={achievement.label}
            style={{ width: "46px", height: "46px", objectFit: "contain" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontSize: "26px" }}>{achievement.emoji}</span>
        )}
      </div>

      <span
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#222",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {achievement.label}
      </span>

      <RarityBadge
        rarity={achievement.rarity}
        color={achievement.rarityColor}
      />

      {!isUnlocked && (
        <span style={{ fontSize: "10px", color: "#aaa" }}>Locked 🔒</span>
      )}
    </div>
  );
}

export default function AchievementsSection({
  unlockedKeys = [],
  equippedAvatar = null,
  onViewAll,
  onAvatarChange, 
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const unlocked = ALL_ACHIEVEMENTS.filter((a) => unlockedKeys.includes(a.key));

  // Show first 4 unlocked; if none, show first 4 as locked previews
  const displayed =
    unlocked.length > 0 ? unlocked.slice(0, 4) : ALL_ACHIEVEMENTS.slice(0, 4);

  const handleCardClick = (achievement) => {
    setSelectedAchievement(achievement);
    setPickerOpen(true);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#FDDCB5",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <span
              style={{ fontSize: "16px", fontWeight: "700", color: "#111" }}
            >
              Achievements
            </span>
            <span
              style={{
                marginLeft: "8px",
                fontSize: "13px",
                color: "#888",
                fontWeight: "500",
              }}
            >
              {unlocked.length}/{ALL_ACHIEVEMENTS.length} unlocked
            </span>
          </div>
          <button
            onClick={onViewAll}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2945A8",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "underline",
            }}
          >
            View all →
          </button>
        </div>

        {/* Hint */}
        {unlocked.length > 0 && (
          <p
            style={{
              fontSize: "11px",
              color: "#a07850",
              margin: "0 0 12px 0",
              fontStyle: "italic",
            }}
          >
            Tap an unlocked achievement to set it as your avatar
          </p>
        )}

        {/* Achievement grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
          }}
        >
          {displayed.map((achievement) => (
            <AchievementCard
              key={achievement.key}
              achievement={achievement}
              isUnlocked={unlockedKeys.includes(achievement.key)}
              isEquipped={equippedAvatar === achievement.key}
              onClick={() => handleCardClick(achievement)}
            />
          ))}
        </div>
      </div>

      {/* Avatar picker modal */}
      {pickerOpen && selectedAchievement && (
        <AvatarPickerModal
          achievement={selectedAchievement}
          isCurrentlyEquipped={equippedAvatar === selectedAchievement.key}
          onEquip={(key) => {
            setPickerOpen(false);
            onAvatarChange?.(key);
          }}
          onUnequip={() => {
            setPickerOpen(false);
            onAvatarChange?.(null);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
