const pool = require('../config/db');

async function getAllFoodPlaces({ category, cuisine, minLat, maxLat, minLon, maxLon, limit = 10 }) {
  let query = 'SELECT * FROM food_places WHERE 1=1';
  const params = [];

  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }
  if (cuisine) {
    params.push(cuisine);
    query += ` AND cuisine = $${params.length}`;
  }
  if (minLat && maxLat && minLon && maxLon) {
    params.push(minLon, minLat, maxLon, maxLat);
    query += ` AND ST_Within(geom, ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326))`;
  }

  params.push(limit);
  query += ` LIMIT $${params.length}`;

  const result = await pool.query(query, params);
  return result.rows;
}

async function getFoodPlaceById(id) {
  const result = await pool.query('SELECT * FROM food_places WHERE id = $1', [id]);
  return result.rows[0];
}

// Save Google data back to the DB row
async function updateGoogleCache(id, { googlePlaceId, rating, reviewCount, reviews }) {
  await pool.query(
    `UPDATE food_places
     SET google_place_id    = $1,
         google_rating       = $2,
         google_review_count = $3,
         google_reviews      = $4,
         google_cached_at    = NOW()
     WHERE id = $5`,
    [googlePlaceId, rating, reviewCount, JSON.stringify(reviews), id]
  );
}

module.exports = { getAllFoodPlaces, getFoodPlaceById, updateGoogleCache };