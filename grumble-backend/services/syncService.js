require("dotenv").config();
const { Pool } = require("pg");
const { fetchFoodPlaces } = require("./osmService");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function storeFoodPlaces(places) {
  for (const place of places) {
    const lat = place.lat ?? place.center?.lat;
    const lon = place.lon ?? place.center?.lon;
    const tags = place.tags || {};

    await pool.query(
      `INSERT INTO food_places (
        osm_id, name, cuisine, category, lat, lon, address, opening_hours, geom
       )
       VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)
       )
       ON CONFLICT (osm_id) DO UPDATE
       SET name = EXCLUDED.name,
           cuisine = EXCLUDED.cuisine,
           category = EXCLUDED.category,
           lat = EXCLUDED.lat,
           lon = EXCLUDED.lon,
           address = EXCLUDED.address,
           opening_hours = EXCLUDED.opening_hours,
           geom = EXCLUDED.geom`,
      [
        place.id,
        tags.name || "Unknown",
        tags.cuisine || null,
        tags.amenity || null,
        lat,
        lon,
        tags["addr:full"] || tags["addr:street"] || null,
        tags.opening_hours || null,
        lon,
        lat,
      ],
    );
  }
}

async function syncFoodPlaces() {
  try {
    console.log("🔄 Fetching food places from Overpass API...");
    const places = await fetchFoodPlaces();
    console.log(`✅ Retrieved ${places.length} places. Storing in database...`);
    await storeFoodPlaces(places);
    console.log("✅ Sync complete! All food places stored in database.");
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    if (error.response?.status === 504) {
      console.error("   The Overpass API server is temporarily unavailable.");
      console.error("   Please try again in a few minutes.");
    } else if (error.response?.status === 429) {
      console.error(
        "   Rate limited by Overpass API. Please wait before retrying.",
      );
    } else {
      console.error("   Full error:", error);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

module.exports = { syncFoodPlaces };
