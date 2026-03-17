const express = require('express');
const cors = require('cors');
const app = express();
const foodPlaceRoutes = require('./routes/foodPlaceRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/food-places', foodPlaceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Admin panel routes

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;