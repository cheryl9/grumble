const pool = require("../config/db");

async function getAllFoodPlaces({ category, cuisine, minLat, maxLat, minLon, maxLon, q, limit = 10 }) {
  let query = "SELECT * FROM food_places WHERE 1=1";
  const params = [];

  const qTrimmed = typeof q === "string" ? q.trim() : "";

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

  if (qTrimmed) {
    params.push(`%${qTrimmed}%`);
    query += ` AND (name ILIKE $${params.length} OR address ILIKE $${params.length})`;
    query += " ORDER BY name ASC";
  }

  params.push(limit);
  query += ` LIMIT $${params.length}`;

  const result = await pool.query(query, params);
  return result.rows;
}

async function getFoodPlaceById(id) {
  const result = await pool.query("SELECT * FROM food_places WHERE id = $1", [id]);
  return result.rows[0];
}

async function createFoodPlace({ name, cuisine, category, latitude, longitude, address, opening_hours }) {
  const hasCoords = latitude != null && longitude != null;
  let query;
  let params;

  if (hasCoords) {
    query = `
      INSERT INTO food_places (name, cuisine, category, lat, lon, address, opening_hours, geom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_Point($5, $4), 4326))
      RETURNING *
    `;
    params = [name, cuisine || null, category || null, latitude, longitude, address || null, opening_hours || null];
  } else {
    query = `
      INSERT INTO food_places (name, cuisine, category, address, opening_hours)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    params = [name, cuisine || null, category || null, address || null, opening_hours || null];
  }

  const result = await pool.query(query, params);
  return result.rows[0];
}

async function convertPostcodeToCoordinates(postcode) {
  try {
    if (!postcode || !/^\d{6}$/.test(postcode.toString().trim())) {
      return { success: false, error: "Invalid postcode format (must be 6 digits)" };
    }

    const result = await pool.query(
      `SELECT postal_code, latitude, longitude, building_name, address
       FROM buildings WHERE postal_code = $1 LIMIT 1`,
      [postcode.trim()]
    );

    if (result.rows.length === 0) {
      return { success: false, error: `Postal code ${postcode} not found in Singapore` };
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
    return { success: false, error: "Database error when converting postcode" };
  }
}

/**
 * Get friends who have visited a food place based on friend posts near the place.
 * "Visited" is inferred if a friend's post is within threshold meters of the place
 * or if the post shares the same postal code as nearby known buildings of the place.
 */
async function getFriendsWhoVisited(
  restaurantId,
  userId,
  thresholdMeters = 100,
  postalMatchRadiusMeters = 1500,
) {
  const restaurantResult = await pool.query(
    `SELECT id, lat, lon
     FROM food_places
     WHERE id = $1`,
    [restaurantId],
  );

  const place = restaurantResult.rows[0];
  if (!place || place.lat == null || place.lon == null) {
    return [];
  }

  // Use PostGIS geography distance for accurate meters and good query performance.
  const result = await pool.query(
    `WITH nearby_restaurant_postcodes AS (
      -- Postal codes around the restaurant point (primary match strategy)
      SELECT DISTINCT b.postal_code
      FROM buildings b
      WHERE b.postal_code IS NOT NULL
        AND b.latitude IS NOT NULL
        AND b.longitude IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(b.longitude::double precision, b.latitude::double precision), 4326)::geography,
          ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography,
          $5
        )
    ),
    nearest_restaurant_postcode AS (
      -- Fallback to nearest building postcode in case no nearby rows are found
      SELECT b.postal_code
      FROM buildings b
      WHERE b.postal_code IS NOT NULL
        AND b.latitude IS NOT NULL
        AND b.longitude IS NOT NULL
      ORDER BY ST_Distance(
        ST_SetSRID(ST_MakePoint(b.longitude::double precision, b.latitude::double precision), 4326)::geography,
        ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography
      )
      LIMIT 1
    ),
    restaurant_postcodes AS (
      SELECT postal_code FROM nearby_restaurant_postcodes
      UNION
      SELECT postal_code FROM nearest_restaurant_postcode
    ),
    my_friends AS (
      SELECT DISTINCT
        CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END AS friend_id
      FROM friendships f
      WHERE (f.user_id = $1 OR f.friend_id = $1)
        AND f.status = 'accepted'
    ),
    nearby_friend_posts AS (
      SELECT DISTINCT p.user_id
      FROM posts p
      JOIN my_friends mf ON mf.friend_id = p.user_id
      JOIN food_places fp ON fp.id = p.food_place_id
      WHERE p.is_deleted = false
        AND fp.lat IS NOT NULL
        AND fp.lon IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(fp.lon, fp.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography,
          $4
        )
    ),
    postal_friend_posts AS (
      SELECT DISTINCT p.user_id
      FROM posts p
      JOIN my_friends mf ON mf.friend_id = p.user_id
      JOIN restaurant_postcodes rp ON rp.postal_code = p.postal_code
      WHERE p.is_deleted = false
        AND p.postal_code IS NOT NULL
    ),
    matched_friends AS (
      SELECT user_id FROM nearby_friend_posts
      UNION
      SELECT user_id FROM postal_friend_posts
    )
    SELECT u.id, u.username, u.avatar_url, u.equipped_avatar
    FROM matched_friends mf
    JOIN users u ON u.id = mf.user_id
    ORDER BY u.username ASC`,
    [userId, place.lat, place.lon, thresholdMeters, postalMatchRadiusMeters],
  );

  return result.rows;
}

module.exports = {
  getAllFoodPlaces,
  getFoodPlaceById,
  createFoodPlace,
  convertPostcodeToCoordinates,
  getFriendsWhoVisited,
};
