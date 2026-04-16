const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const foodPlaceRoutes = require('./routes/foodPlaceRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middleware/errorHandler');
const faqController = require('./controllers/admin/faqController');

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Grumble API is running');
});

app.get('/api/faqs', faqController.getFAQs);

app.use('/api/posts', postRoutes);
app.use('/api/food-places', foodPlaceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 

app.use(errorHandler);

module.exports = app;