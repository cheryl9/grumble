const express = require('express');
const cors = require('cors');
const app = express();
const foodPlaceRoutes = require('./routes/foodPlaceRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/food-places', foodPlaceRoutes);
app.use('/api/auth', authRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;