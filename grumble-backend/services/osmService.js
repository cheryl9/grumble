const axios = require('axios');

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

  const response = await axios.post(
    'https://overpass-api.de/api/interpreter',
    `data=${encodeURIComponent(query)}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.elements;
}

module.exports = { fetchFoodPlaces };

//DOUBLE CHECK THIS
DATABASE_URL= 'postgresql://postgres:JBMY6772@localhost:5432/grumble'
PORT=3000