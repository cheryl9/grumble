const {
  getAllFoodPlaces,
  getFoodPlaceById,
  createFoodPlace,
  convertPostcodeToCoordinates,
  getFriendsWhoVisited,
} = require("../repositories/foodPlaceRepository");
const { getGoogleData } = require("../services/googlePlacesService");
const axios = require("axios");

// Map postal code prefix to region (matches postalCodeMapper.js logic)
const POSTAL_CODE_TO_REGION = {
  "01": "Central",
  "02": "Central",
  "03": "East",
  "04": "Central",
  "05": "Central",
  "06": "Central",
  "07": "Central",
  "08": "Central",
  "09": "Central",
  10: "Central",
  11: "Central",
  12: "Central",
  13: "Central",
  14: "Central",
  15: "Central",
  16: "Central",
  70: "West", // Tengah/Lim Chu Kang
  71: "West",
  72: "Central",
  73: "Central",
  74: "Central",
  75: "Central",
  76: "Central",
  77: "Central",
  78: "Central",
  79: "North-East", // Seletar
  18: "Central", // Bugis, Rochor, Golden Mile
  19: "Central",
  20: "Central",
  21: "Central",
  22: "Central", // Orchard/River Valley
  23: "Central",
  24: "Central", // Tanglin, Bukit Timah, Newton, Thomson
  25: "Central",
  26: "Central",
  27: "Central",
  28: "Central",
  29: "Central",
  30: "North-East", // Serangoon/Hougang
  31: "Central", // Balestier, Toa Payoh
  32: "Central",
  33: "Central",
  // East (34-48, 49-52, 80, 81)
  34: "East",
  35: "East",
  36: "East",
  37: "East",
  38: "East",
  39: "East",
  40: "East",
  41: "East",
  42: "East",
  43: "East",
  44: "East",
  45: "East",
  46: "East",
  47: "East",
  48: "East",
  49: "East", // Changi, Loyang, Tampines, Pasir Ris
  50: "East",
  51: "East",
  52: "East",
  80: "East", // Paya Lebar/Macpherson
  81: "East", // Changi Airport
  82: "North-East", // Punggol/Sengkang
  // West (17, 53-69)
  17: "West",
  53: "West",
  54: "West",
  55: "West",
  56: "West",
  57: "West",
  58: "West",
  59: "West",
  60: "West",
  61: "West",
  62: "West",
  63: "West",
  64: "West",
  65: "West",
  66: "West",
  67: "West",
  68: "West",
  69: "West",
};

// Extract postal code prefix from address and get region
function getRegionFromAddress(address) {
  if (!address) return null;
  const match = address.match(/\b(\d{6})\b/);
  if (!match) return null;
  const postalCode = match[1];
  const prefix = postalCode.substring(0, 2);

  // Special handling for 03 range which spans Central and East
  if (prefix === "03") {
    const full4Digit = postalCode.substring(0, 4);
    const postal4 = parseInt(full4Digit);
    // 0381-0389: East Coast areas (Katong, Marine Parade, etc.)
    // 0390-0399 & 0301-0380: Central areas (Marina Bay, Bugis, Beach Road, Marina Square, etc.)
    if (postal4 >= 381 && postal4 <= 389) {
      return "East";
    }
    return "Central";
  }

  return POSTAL_CODE_TO_REGION[prefix] || null;
}

// ========== RATE LIMITING & CACHING ==========
const apiCallTracker = {
  google: { count: 0, resetTime: Date.now() + 86400000 },
};

const DAILY_LIMITS = {
  google: 10,
};

const cache = new Map();
const CACHE_TTL = 3600000;

function checkAndResetDaily(service) {
  const now = Date.now();
  if (now > apiCallTracker[service].resetTime) {
    apiCallTracker[service].count = 0;
    apiCallTracker[service].resetTime = now + 86400000;
  }
}

function canMakeApiCall(service) {
  checkAndResetDaily(service);
  const limit = DAILY_LIMITS[service];
  const current = apiCallTracker[service].count;
  const remaining = limit - current;

  if (remaining <= 0) {
    console.warn(`⚠️  ${service} API limit reached! (${current}/${limit})`);
    return false;
  }

  if (remaining < 10) {
    console.warn(
      `⚠️  ${service} API approaching limit! ${remaining} calls remaining`,
    );
  }

  return true;
}

function incrementApiCall(service) {
  apiCallTracker[service].count++;
  console.log(
    `📊 ${service} API calls: ${apiCallTracker[service].count}/${DAILY_LIMITS[service]}`,
  );
}

function getCacheKey(...args) {
  return args.join("|");
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("✅ Cache hit:", key);
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ========== CONTROLLERS ==========
async function enrichWithGoogle(place) {
  try {
    const cacheKey = getCacheKey("google", place.name, place.lat, place.lon);
    const cached = getFromCache(cacheKey);
    if (cached) return { ...place, google: cached };

    if (!canMakeApiCall("google")) {
      console.log("❌ Google API limit reached, skipping enrichment");
      return { ...place, google: null };
    }

    const lat = place.lat ?? place.latitude;
    const lon = place.lon ?? place.longitude;
    const googleData = await getGoogleData(place.name, lat, lon);

    if (googleData) {
      incrementApiCall("google");
      setCache(cacheKey, googleData);
    }

    return { ...place, google: googleData ?? null };
  } catch (err) {
    console.error(
      `Google enrichment failed for place ${place.id}:`,
      err.message,
    );
    return { ...place, google: null };
  }
}

async function getAllFoodPlacesHandler(req, res) {
  try {
    const { minLat, maxLat, minLon, maxLon, q } = req.query;

    // If search query provided, use text search instead of nearby search
    if (q) {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/textsearch/json",
        {
          params: {
            query: `${q} restaurant Singapore`,
            key: process.env.GOOGLE_PLACES_API_KEY,
          },
        },
      );

      console.log("Google Places text search status:", response.data.status);
      console.log("Google Places results count:", response.data.results?.length);

      const results = response.data.results
        .filter(
          (place) =>
            place.geometry.location.lat >= 1.2 &&
            place.geometry.location.lat <= 1.47 &&
            place.geometry.location.lng >= 103.6 &&
            place.geometry.location.lng <= 104.1,
        )
        .slice(0, 10);

      const places = results.map((place) => ({
        id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
        address: place.formatted_address || place.vicinity || "Address unavailable",
        cuisine: "Unknown",
        category: "restaurant",
        google: {
          address: place.formatted_address || place.vicinity || "Address unavailable",
          rating: place.rating ?? null,
          reviewCount: place.user_ratings_total ?? null,
          priceLevel: place.price_level ?? null,
          openingHours: null,
          image: place.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
            : null,
        },
        region: getRegionFromAddress(place.formatted_address || place.vicinity || ""),
      }));

      return res.json(places);
    }

    // Otherwise use nearby search with geographic bounds
    const lat = (parseFloat(minLat) + parseFloat(maxLat)) / 2 || 1.3521;
    const lon = (parseFloat(minLon) + parseFloat(maxLon)) / 2 || 103.8198;

    // Fetch directly from Google Places Nearby Search
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lon}`,
          radius: 5000,
          type: "restaurant",
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      },
    );

    console.log("Google Places status:", response.data.status);
    console.log("Google Places results count:", response.data.results?.length);
    console.log("Google API key exists:", !!process.env.GOOGLE_PLACES_API_KEY);

    const results = response.data.results.slice(0, 10);

    const places = results.map((place) => ({
      id: place.place_id,
      name: place.name,
      lat: place.geometry.location.lat,
      lon: place.geometry.location.lng,
      address: place.vicinity,
      cuisine: "Unknown",
      category: "restaurant",
      google: {
        address: place.vicinity,
        rating: place.rating ?? null,
        reviewCount: place.user_ratings_total ?? null,
        priceLevel: place.price_level ?? null,
        openingHours:
          place.opening_hours?.open_now != null
            ? place.opening_hours.open_now
              ? "Open now"
              : "Closed now"
            : null,
        image: place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
          : null,
      },
      region: getRegionFromAddress(place.vicinity),
    }));

    res.json(places);
  } catch (error) {
    console.error("Failed to fetch from Google Places:", error.message);
    res.status(500).json({ error: "Failed to fetch food places" });
  }
}

// Used by chat "Suggest Food". This searches the app database so the returned
// IDs are compatible with food_suggestions.food_place_id (integer FK).
async function getFoodPlacesSuggestionsHandler(req, res) {
  try {
    const {
      q,
      limit,
      category,
      cuisine,
      minLat,
      maxLat,
      minLon,
      maxLon,
      enrich,
    } = req.query;

    const qTrimmed = typeof q === "string" ? q.trim() : "";
    if (!qTrimmed) return res.json([]);

    const parsedLimit = Number.parseInt(limit, 10);
    const effectiveLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

    const places = await getAllFoodPlaces({
      q: qTrimmed,
      limit: effectiveLimit,
      category: category || null,
      cuisine: cuisine || null,
      minLat,
      maxLat,
      minLon,
      maxLon,
    });

    if (String(enrich).toLowerCase() === "true") {
      const enriched = await Promise.all(
        places.map(async (place) => enrichWithGoogle(place)),
      );
      return res.json(enriched);
    }

    return res.json(places);
  } catch (error) {
    console.error("Failed to fetch food place suggestions:", error);
    res.status(500).json({ error: "Failed to fetch food place suggestions" });
  }
}

async function getFoodPlaceByIdHandler(req, res) {
  try {
    const place = await getFoodPlaceById(req.params.id);
    if (!place) return res.status(404).json({ error: "Food place not found" });
    const enriched = await enrichWithGoogle(place);
    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch food place" });
  }
}

async function createFoodPlaceHandler(req, res) {
  try {
    const {
      name,
      cuisine,
      category,
      latitude,
      longitude,
      address,
      opening_hours,
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Food place name is required" });
    }

    const place = await createFoodPlace({
      name: name.trim(),
      cuisine: cuisine || null,
      category: category || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || null,
      opening_hours: opening_hours || null,
    });

    res.status(201).json(place);
  } catch (error) {
    console.error("createFoodPlace error:", error);
    res.status(500).json({ error: "Failed to create food place" });
  }
}

async function convertPostcodeHandler(req, res) {
  try {
    const { postcode } = req.query;

    if (!postcode || !/^\d{6}$/.test(postcode.trim())) {
      return res.status(400).json({
        success: false,
        error: "Invalid postal code (must be 6 digits)",
      });
    }

    const result = await convertPostcodeToCoordinates(postcode.trim());

    if (result.success) {
      res.json({
        success: true,
        latitude: result.latitude,
        longitude: result.longitude,
        postal_code: result.postal_code,
        address: result.address,
      });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Postcode handler error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error when converting postcode" });
  }
}

async function searchFoodPlaces(req, res) {
  res.status(410).json({
    success: false,
    message:
      "Foursquare integration has been removed. Use Google Places search instead.",
  });
}

async function getApiUsage(req, res) {
  checkAndResetDaily("google");
  res.json({
    google: {
      used: apiCallTracker.google.count,
      limit: DAILY_LIMITS.google,
      remaining: DAILY_LIMITS.google - apiCallTracker.google.count,
      resetTime: new Date(apiCallTracker.google.resetTime).toISOString(),
    },
  });
}

/**
 * Get friends who have visited a food place
 * Query: GET /api/food-places/:id/friends-visited
 * Requires authentication
 * Response: {friendsVisited: [{id, username}, ...]}
 */
async function getFriendsWhoVisitedHandler(req, res) {
  try {
    const restaurantId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const friendsVisited = await getFriendsWhoVisited(restaurantId, userId);
    res.json({ friendsVisited });
  } catch (error) {
    console.error("Error fetching friends who visited:", error);
    res.status(500).json({ error: "Failed to fetch friends who visited" });
  }
}

module.exports = {
  getAllFoodPlacesHandler,
  getFoodPlacesSuggestionsHandler,
  getFoodPlaceByIdHandler,
  searchFoodPlaces,
  getApiUsage,
  createFoodPlaceHandler,
  convertPostcodeHandler,
  getFriendsWhoVisitedHandler,
};
