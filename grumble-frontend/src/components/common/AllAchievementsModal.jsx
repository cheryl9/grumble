import { X } from "lucide-react";
import tinyTummyImg from "../../assets/avatars/tiny_tummy.png";
import gutGuardianImg from "../../assets/avatars/gut_guardian.png";
import digestiveDynamoImg from "../../assets/avatars/digestive_dynamo.png";
import goldenKidneyImg from "../../assets/avatars/golden_kidney.png";
import beanThereImg from "../../assets/avatars/bean_there_done_that.png";
import snackGoblinImg from "../../assets/avatars/snack_goblin.png";
import liverItUpImg from "../../assets/avatars/liver_it_up.png";
import kidneyBeanImg from "../../assets/avatars/kidney_bean.png";
import heartOfFeastImg from "../../assets/avatars/heart_of_the_feast.png";
import openStomachImg from "../../assets/avatars/open_stomach_policy.png";
import kidneyCrewImg from "../../assets/avatars/kidney_crew.png";

const ACHIEVEMENTS = [
  {
    key: "tiny_tummy",
    name: "Tiny Tummy",
    description: "Created your first post",
    rarity: "COMMON",
    image: tinyTummyImg,
  },
  {
    key: "gut_guardian",
    name: "Gut Guardian",
    description: "Maintained a 7-day streak",
    rarity: "RARE",
    image: gutGuardianImg,
  },
  {
    key: "digestive_dynamo",
    name: "Digestive Dynamo",
    description: "Maintained a 14-day streak",
    rarity: "RARE",
    image: digestiveDynamoImg,
  },
  {
    key: "golden_kidney",
    name: "Golden Kidney",
    description: "Visited 10 unique cafes",
    rarity: "RARE",
    image: goldenKidneyImg,
  },
  {
    key: "bean_there_done_that",
    name: "Bean There, Done That",
    description: "Shared a restaurant review with a friend",
    rarity: "EPIC",
    image: beanThereImg,
  },
  {
    key: "snack_goblin",
    name: "Snack Goblin",
    description: "Posted 15 dessert reviews",
    rarity: "RARE",
    image: snackGoblinImg,
  },
  {
    key: "liver_it_up",
    name: "Liver It Up",
    description: "Posted a late-night review (after midnight)",
    rarity: "COMMON",
    image: liverItUpImg,
  },
  {
    key: "kidney_bean",
    name: "Kidney Bean",
    description: "Posted 10 reviews from drink stores",
    rarity: "RARE",
    image: kidneyBeanImg,
  },
  {
    key: "heart_of_the_feast",
    name: "Heart of the Feast",
    description: "Posted 50 dining reviews",
    rarity: "EPIC",
    image: heartOfFeastImg,
  },
  {
    key: "open_stomach_policy",
    name: "Open Stomach Policy",
    description: "Posted 10 reviews",
    rarity: "RARE",
    image: openStomachImg,
  },
  {
    key: "kidney_crew",
    name: "Kidney Crew",
    description: "Made 10 friends",
    rarity: "EPIC",
    image: kidneyCrewImg,
  },
];

export default function AllAchievementsModal({
  unlockedKeys = [],
  onClose,
  onAvatarSelect,
}) {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "COMMON":
        return "#8b7355";
      case "RARE":
        return "#4169e1";
      case "EPIC":
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
                onClick={() => isUnlocked && onAvatarSelect?.(achievement.key)}
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
                  alt={achievement.name}
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
                  {achievement.name}
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
                  {achievement.rarity}
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
    </div>
  );
}
