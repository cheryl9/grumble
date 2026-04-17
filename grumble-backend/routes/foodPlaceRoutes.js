const express = require("express");
const router = express.Router();
const {
  getAllFoodPlacesHandler,
  getFoodPlaceByIdHandler,
  getApiUsage,
  createFoodPlaceHandler,
  convertPostcodeHandler,
} = require("../controllers/foodPlaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getAllFoodPlacesHandler);
router.get("/api-usage", getApiUsage);          
router.get("/convert-postcode", convertPostcodeHandler);  
router.get("/:id", getFoodPlaceByIdHandler);
router.post("/", authMiddleware, createFoodPlaceHandler);

module.exports = router;