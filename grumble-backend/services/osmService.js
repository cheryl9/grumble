const axios = require("axios");

// async function to fetch data from external API and takes time, so we use async to not block the main thread

//[out:json] is a directive that tells the Overpass API to return the results in JSON format.
//[timeout:60] sets a timeout of 60 seconds for the query, ensuring that it doesn't run indefinitely.
// node and way — OSM stores data as nodes (single points like a restaurant) and ways (shapes like a building footprint).
// "amenity"~"restaurant|cafe|..." — filters for food related places only
//(1.1304,103.6020,1.4504,104.0850) — this is Singapore's bounding box, essentially a rectangle of coordinates that limits results to Singapore only

async function fetchFoodPlaces() {
  const query = `
    [out:json][timeout:60];
    (
      node["amenity"~"restaurant|cafe|food_court|hawker_centre|fast_food"](1.1304,103.6020,1.4504,104.0850);
      way["amenity"~"restaurant|cafe|food_court|hawker_centre|fast_food"](1.1304,103.6020,1.4504,104.0850);
    );
    out center;
  `;

  const MAX_RETRIES = 3;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        "https://overpass-api.de/api/interpreter",
        `data=${encodeURIComponent(query)}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 120000, // 120 seconds timeout
        },
      );

      return response.data.elements;
    } catch (error) {
      lastError = error;

      // 504 Gateway Timeout or 429 Too Many Requests - retry with exponential backoff
      if (
        (error.response?.status === 504 || error.response?.status === 429) &&
        attempt < MAX_RETRIES
      ) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(
          `⚠️  Overpass API temporary issue (${error.response.status}). Retrying in ${waitTime / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // Other errors - throw immediately
      throw error;
    }
  }

  throw lastError;
}

module.exports = { fetchFoodPlaces };
