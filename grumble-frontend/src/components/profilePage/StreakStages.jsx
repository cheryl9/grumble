import stage1 from "../../assets/streak/stage1.png";
import stage2 from "../../assets/streak/stage2.png";
import stage3 from "../../assets/streak/stage3.png";
import stage4 from "../../assets/streak/stage4.png";
import stage5 from "../../assets/streak/stage5.png";
import stage6 from "../../assets/streak/stage6.png";
import stage7 from "../../assets/streak/stage7.png";
import stage8 from "../../assets/streak/stage8.png";

export const STREAK_STAGES = [
  { min: 0, max: 2, image: stage1, name: "Newborn Grumble" },
  { min: 3, max: 5, image: stage2, name: "Baby Grumble" },
  { min: 6, max: 13, image: stage3, name: "Growing Grumble" },
  { min: 14, max: 20, image: stage4, name: "Happy Grumble" },
  { min: 21, max: 29, image: stage5, name: "Strong Grumble" },
  { min: 30, max: 44, image: stage6, name: "Mighty Grumble" },
  { min: 45, max: 999, image: stage7, name: "Experienced Grumble" },
  { min: 45, max: 999, image: stage8, name: "Seasoned Grumble" },
];

export function getStageForStreak(streak) {
  return (
    STREAK_STAGES.find((s) => streak >= s.min && streak <= s.max) ??
    STREAK_STAGES[STREAK_STAGES.length - 1]
  );
}
