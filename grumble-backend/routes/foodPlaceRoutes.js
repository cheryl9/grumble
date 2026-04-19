const express = require("express");
const router = express.Router();
const {
  getAllFoodPlacesHandler,
  getFoodPlacesSuggestionsHandler,
  getFoodPlaceByIdHandler,
  getApiUsage,
  createFoodPlaceHandler,
  convertPostcodeHandler,
  getFriendsWhoVisitedHandler,
} = require("../controllers/foodPlaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getAllFoodPlacesHandler);
router.get("/suggestions", getFoodPlacesSuggestionsHandler);
router.get("/api-usage", getApiUsage);          
router.get("/convert-postcode", convertPostcodeHandler);  

router.get("/convert-postcode", convertPostcodeHandler);

// Get friends who have visited a food place (requires auth)
router.get("/:id/friends-visited", authMiddleware, getFriendsWhoVisitedHandler);

router.get("/:id", getFoodPlaceByIdHandler);
router.post("/", authMiddleware, createFoodPlaceHandler);

module.exports = router;