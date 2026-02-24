# Grumble Backend

## Prerequisites
- Node.js
- PostgreSQL with PostGIS extension
- npm

## Setup

1. Install dependencies
   npm install

2. Create a `.env` file based on `.env.example` and fill in your credentials

3. Set up the database
   psql -U postgres -d your_database -f migrations/001_create_food_places.sql

4. Sync food places from OpenStreetMap
   node scripts/syncOSM.js

5. Start the server
   node server.js

## API Endpoints

GET /api/food-places — Get all food places
GET /api/food-places?category=cafe — Filter by category
GET /api/food-places?cuisine=chinese — Filter by cuisine
GET /api/food-places/:id — Get a single food place by ID