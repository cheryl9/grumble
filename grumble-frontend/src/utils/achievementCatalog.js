import tinyTummyImg from "../assets/avatars/tiny_tummy.png";
import gutGuardianImg from "../assets/avatars/gut_guardian.png";
import digestiveDynamoImg from "../assets/avatars/digestive_dynamo.png";
import goldenKidneyImg from "../assets/avatars/golden_kidney.png";
import beanThereImg from "../assets/avatars/bean_there_done_that.png";
import snackGoblinImg from "../assets/avatars/snack_goblin.png";
import liverItUpImg from "../assets/avatars/liver_it_up.png";
import kidneyBeanImg from "../assets/avatars/kidney_bean.png";
import heartOfFeastImg from "../assets/avatars/heart_of_the_feast.png";
import openStomachImg from "../assets/avatars/open_stomach_policy.png";
import kidneyCrewImg from "../assets/avatars/kidney_crew.png";

export const ACHIEVEMENT_CATALOG = [
  {
    key: "tiny_tummy",
    label: "Tiny Tummy",
    description: "Post your very first Grumble restaurant review.",
    avatarFile: "tiny_tummy.png",
    rarity: "common",
    image: tinyTummyImg,
  },
  {
    key: "gut_guardian",
    label: "Gut Guardian",
    description: "Post restaurant reviews for 7 days in a row.",
    avatarFile: "gut_guardian.png",
    rarity: "rare",
    image: gutGuardianImg,
  },
  {
    key: "digestive_dynamo",
    label: "Digestive Dynamo",
    description: "Maintain a 14-day Grumble streak.",
    avatarFile: "digestive_dynamo.png",
    rarity: "rare",
    image: digestiveDynamoImg,
  },
  {
    key: "golden_kidney",
    label: "Golden Kidney",
    description: "Post at 10 different food places.",
    avatarFile: "golden_kidney.png",
    rarity: "rare",
    image: goldenKidneyImg,
  },
  {
    key: "bean_there_done_that",
    label: "Bean There, Done That",
    description: "Visit and post at the same restaurant as your friend.",
    avatarFile: "bean_there_done_that.png",
    rarity: "epic",
    image: beanThereImg,
  },
  {
    key: "snack_goblin",
    label: "Star Hunter",
    description: "Create 15 five-star reviews.",
    avatarFile: "snack_goblin.png",
    rarity: "rare",
    image: snackGoblinImg,
  },
  {
    key: "liver_it_up",
    label: "Liver It Up",
    description: "Post your first late-night supper spot after 12am.",
    avatarFile: "liver_it_up.png",
    rarity: "common",
    image: liverItUpImg,
  },
  {
    key: "kidney_bean",
    label: "Kidney Bean",
    description: "Review 10 drink stores.",
    avatarFile: "kidney_bean.png",
    rarity: "rare",
    image: kidneyBeanImg,
  },
  {
    key: "heart_of_the_feast",
    label: "Heart of the Feast",
    description: "Share reviews for 50 dining restaurants.",
    avatarFile: "heart_of_the_feast.png",
    rarity: "epic",
    image: heartOfFeastImg,
  },
  {
    key: "open_stomach_policy",
    label: "Open Stomach Policy",
    description: "Post 10 reviews.",
    avatarFile: "open_stomach_policy.png",
    rarity: "epic",
    image: openStomachImg,
  },
  {
    key: "kidney_crew",
    label: "Kidney Crew",
    description: "Make 10 friends on Grumble.",
    avatarFile: "kidney_crew.png",
    rarity: "epic",
    image: kidneyCrewImg,
  },
];

export const ACHIEVEMENT_BY_KEY = ACHIEVEMENT_CATALOG.reduce((acc, achievement) => {
  acc[achievement.key] = achievement;
  return acc;
}, {});
