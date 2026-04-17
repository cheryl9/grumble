const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = "https://maps.googleapis.com/maps/api/place";

// Find a place on Google by name + lat/lon
async function findGooglePlaceId(name, lat, lon) {
  const response = await axios.get(`${BASE_URL}/findplacefromtext/json`, {
    params: {
      input: name,
      inputtype: "textquery",
      locationbias: `point:${lat},${lon}`,
      fields: "place_id,name",
      key: GOOGLE_API_KEY,
    },
  });

  const candidates = response.data.candidates;
  if (!candidates || candidates.length === 0) return null;
  return candidates[0].place_id;
}

// Fetch rating + reviews + price_level + address + photos + opening hours using the place_id
async function getPlaceDetails(googlePlaceId) {
  const response = await axios.get(`${BASE_URL}/details/json`, {
    params: {
      place_id: googlePlaceId,
      fields:
        "rating,user_ratings_total,reviews,price_level,formatted_address,photos,opening_hours",
      key: GOOGLE_API_KEY,
    },
  });

  const result = response.data.result;
  if (!result) return null;

  return {
    googlePlaceId,
    rating: result.rating ?? null,
    reviewCount: result.user_ratings_total ?? 0,
    priceLevel: result.price_level ?? null,
    address: result.formatted_address ?? null,
    openingHours: result.opening_hours?.weekday_text?.join(", ") ?? null,
    image: result.photos?.[0]?.photo_reference
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${result.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
      : null,
    // Keep only the fields we care about from each review
    reviews: (result.reviews ?? []).map((r) => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description,
    })),
  };
}

async function getGoogleData(name, lat, lon) {
  const placeId = await findGooglePlaceId(name, lat, lon);
  if (!placeId) return null;
  return getPlaceDetails(placeId);
}

module.exports = { getGoogleData };
