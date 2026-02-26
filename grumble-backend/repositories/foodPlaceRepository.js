// TO manage the queries related to food places in the postgres db, we create a repository layer. 
const pool = require('../config/db');

async function getAllFoodPlaces({ category, cuisine, minLat, maxLat, minLon, maxLon }) {
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

  const result = await pool.query(query, params);
  return result.rows;
}

async function getFoodPlaceById(id) {
  const result = await pool.query('SELECT * FROM food_places WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { getAllFoodPlaces, getFoodPlaceById };