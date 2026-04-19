/**
 * Predefined hashtag categories for the Grumble food app
 * Users can select from these or use custom ones
 */

const HASHTAG_CATEGORIES = {
  CUISINE: {
    label: "Cuisine Type",
    tags: [
      "#Japanese",
      "#Korean",
      "#Chinese",
      "#Western",
      "#Indian",
      "#Thai",
      "#Vietnamese",
      "#Italian",
      "#Mexican",
      "#Mediterranean",
      "#Filipino",
      "#Singapore",
      "#Malaysian",
      "#Burmese",
      "#Fusion",
    ],
  },
  VIBE: {
    label: "Vibe",
    tags: [
      "#DateNight",
      "#FamilyFriendly",
      "#SoloEats",
      "#GroupDining",
      "#Casual",
      "#Upscale",
      "#HiddenGem",
      "#Trending",
      "#QuickBite",
      "#Cozy",
    ],
  },
  BUDGET: {
    label: "Budget",
    tags: ["#BudgetEats", "#MidRange", "#Splurge", "#CheapEats"],
  },
  MEAL: {
    label: "Meal Type",
    tags: [
      "#Breakfast",
      "#Brunch",
      "#Lunch",
      "#Dinner",
      "#Supper",
      "#Dessert",
      "#Drinks",
      "#Midnight",
    ],
  },
  DIETARY: {
    label: "Dietary",
    tags: [
      "#Vegetarian",
      "#Vegan",
      "#GlutenFree",
      "#Halal",
      "#Kosher",
      "#HealthyOptions",
      "#LowCalorie",
      "#HighProtein",
    ],
  },
};

// Flatten all tags for easy lookup
const ALL_HASHTAGS = Object.values(HASHTAG_CATEGORIES)
  .flatMap((cat) => cat.tags)
  .map((tag) => tag.replace("#", "")); // Store without #

/**
 * Validate if hashtag is from predefined list or custom
 * @param {string} hashtag - Hashtag without the # symbol
 * @returns {boolean} - true if valid
 */
function isValidHashtag(hashtag) {
  return hashtag && typeof hashtag === "string" && hashtag.length > 0;
}

module.exports = {
  HASHTAG_CATEGORIES,
  ALL_HASHTAGS,
  isValidHashtag,
};
