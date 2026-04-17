const express = require("express");
const router = express.Router();
const {
  getAllFoodPlacesHandler,
  getFoodPlaceByIdHandler,
  getApiUsage,
} = require("../controllers/foodPlaceController");

router.get("/api-usage", getApiUsage); // Check API limits (must be before /:id route)
router.get("/", getAllFoodPlacesHandler);
router.get("/:id", getFoodPlaceByIdHandler);

module.exports = router;
