// controllers/foodPlaceController.js
const { getAllFoodPlaces, getFoodPlaceById } = require('../repositories/foodPlaceRepository');

async function getAllFoodPlacesHandler(req, res) {
  try {
    const { category, cuisine, minLat, maxLat, minLon, maxLon } = req.query;
    const places = await getAllFoodPlaces({ category, cuisine, minLat, maxLat, minLon, maxLon });
    res.json(places);
  } catch (error) {
    console.error('Detailed error:', error.message);  // add this
    res.status(500).json({ error: 'Failed to fetch food places' });
  }
}

async function getFoodPlaceByIdHandler(req, res) {
  try {
    const place = await getFoodPlaceById(req.params.id);
    if (!place) {
      return res.status(404).json({ error: 'Food place not found' });
    }
    res.json(place);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch food place' });
  }
}

module.exports = { getAllFoodPlacesHandler, getFoodPlaceByIdHandler };