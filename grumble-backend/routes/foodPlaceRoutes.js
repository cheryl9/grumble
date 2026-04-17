const express = require("express");
const router = express.Router();
const {
  getAllFoodPlacesHandler,
  getFoodPlaceByIdHandler,
  createFoodPlaceHandler,
  convertPostcodeHandler,
} = require("../controllers/foodPlaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getAllFoodPlacesHandler);

// ⚠️ IMPORTANT: /convert-postcode must come BEFORE /:id
// Otherwise /:id will match "convert-postcode" as an ID
router.get("/convert-postcode", convertPostcodeHandler);

router.get("/:id", getFoodPlaceByIdHandler);
router.post("/", authMiddleware, createFoodPlaceHandler);

module.exports = router;
