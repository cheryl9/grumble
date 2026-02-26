const express = require('express');
const router = express.Router();
const { getAllFoodPlacesHandler, getFoodPlaceByIdHandler } = require('../controllers/foodPlaceController');

router.get('/', getAllFoodPlacesHandler);
router.get('/:id', getFoodPlaceByIdHandler);

module.exports = router;