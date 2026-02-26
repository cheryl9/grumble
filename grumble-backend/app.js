const express = require('express');
const app = express();
const foodPlaceRoutes = require('./routes/foodPlaceRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use('/api/food-places', foodPlaceRoutes);
app.use(errorHandler);

module.exports = app;