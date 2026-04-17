// controllers/foodPlaceController.js
const {
  getAllFoodPlaces,
  getFoodPlaceById,
  createFoodPlace,
  convertPostcodeToCoordinates,
} = require("../repositories/foodPlaceRepository");

async function getAllFoodPlacesHandler(req, res) {
  try {
    const { category, cuisine, minLat, maxLat, minLon, maxLon } = req.query;
    const places = await getAllFoodPlaces({
      category,
      cuisine,
      minLat,
      maxLat,
      minLon,
      maxLon,
    });
    res.json(places);
  } catch (error) {
    console.error("Detailed error:", error.message);
    res.status(500).json({ error: "Failed to fetch food places" });
  }
}

async function getFoodPlaceByIdHandler(req, res) {
  try {
    const place = await getFoodPlaceById(req.params.id);
    if (!place) {
      return res.status(404).json({ error: "Food place not found" });
    }
    res.json(place);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch food place" });
  }
}

async function createFoodPlaceHandler(req, res) {
  try {
    const {
      name,
      cuisine,
      category,
      latitude,
      longitude,
      address,
      opening_hours,
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Food place name is required" });
    }

    const place = await createFoodPlace({
      name: name.trim(),
      cuisine: cuisine || null,
      category: category || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || null,
      opening_hours: opening_hours || null,
    });

    res.status(201).json(place);
  } catch (error) {
    console.error("createFoodPlace error:", error);
    res.status(500).json({ error: "Failed to create food place" });
  }
}

/**
 * Convert Singapore postal code to coordinates
 * Query: GET /api/food-places/convert-postcode?postcode=018956
 * Response: {success: true, latitude, longitude, postal_code, address}
 */
async function convertPostcodeHandler(req, res) {
  try {
    const { postcode } = req.query;

    // Validate input
    if (!postcode || !/^\d{6}$/.test(postcode.trim())) {
      return res.status(400).json({
        success: false,
        error: "Invalid postal code (must be 6 digits)",
      });
    }

    // Query database (no API call - uses pre-fetched data)
    const result = await convertPostcodeToCoordinates(postcode.trim());

    if (result.success) {
      res.json({
        success: true,
        latitude: result.latitude,
        longitude: result.longitude,
        postal_code: result.postal_code,
        address: result.address,
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Postcode handler error:", error);
    res.status(500).json({
      success: false,
      error: "Server error when converting postcode",
    });
  }
}

module.exports = {
  getAllFoodPlacesHandler,
  getFoodPlaceByIdHandler,
  createFoodPlaceHandler,
  convertPostcodeHandler,
};
