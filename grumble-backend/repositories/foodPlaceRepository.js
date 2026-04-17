// TO manage the queries related to food places in the postgres db, we create a repository layer.
const pool = require("../config/db");

async function getAllFoodPlaces({
  category,
  cuisine,
  minLat,
  maxLat,
  minLon,
  maxLon,
}) {
  let query = "SELECT * FROM food_places WHERE 1=1";
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
  const result = await pool.query("SELECT * FROM food_places WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
}

async function createFoodPlace({
  name,
  cuisine,
  category,
  latitude,
  longitude,
  address,
  opening_hours,
}) {
  const hasCoords = latitude != null && longitude != null;
  let query;
  let params;

  if (hasCoords) {
    query = `
      INSERT INTO food_places (name, cuisine, category, lat, lon, address, opening_hours, geom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_Point($5, $4), 4326))
      RETURNING *
    `;
    params = [
      name,
      cuisine || null,
      category || null,
      latitude,
      longitude,
      address || null,
      opening_hours || null,
    ];
  } else {
    query = `
      INSERT INTO food_places (name, cuisine, category, address, opening_hours)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    params = [
      name,
      cuisine || null,
      category || null,
      address || null,
      opening_hours || null,
    ];
  }

  const result = await pool.query(query, params);
  return result.rows[0];
}

/**
 * Convert Singapore postal code to coordinates
 * Queries buildings data (imported from buildings.json)
 * @param {string} postcode - 6-digit postal code
 * @returns {object} - {success: boolean, latitude, longitude, building_name, address, error}
 */
async function convertPostcodeToCoordinates(postcode) {
  try {
    // Validate format: must be 6 digits
    if (!postcode || !/^\d{6}$/.test(postcode.toString().trim())) {
      return {
        success: false,
        error: "Invalid postcode format (must be 6 digits)",
      };
    }

    // Query buildings table (1.8M records from buildings.json)
    const result = await pool.query(
      `SELECT 
        postal_code,
        latitude,
        longitude,
        building_name,
        address
       FROM buildings
       WHERE postal_code = $1
       LIMIT 1`,
      [postcode.trim()],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Postal code ${postcode} not found in Singapore`,
      };
    }

    const row = result.rows[0];
    return {
      success: true,
      postal_code: row.postal_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      building_name: row.building_name || "",
      address: row.address || "",
    };
  } catch (error) {
    console.error("Postcode conversion error:", error);
    return {
      success: false,
      error: "Database error when converting postcode",
    };
  }
}

module.exports = {
  getAllFoodPlaces,
  getFoodPlaceById,
  createFoodPlace,
  convertPostcodeToCoordinates,
};
