const {
  getAllFoodPlaces,
  getFoodPlaceById,
  createFoodPlace,
  convertPostcodeToCoordinates,
  getFriendsWhoVisited,
} = require("../repositories/foodPlaceRepository");
const { getGoogleData } = require("../services/googlePlacesService");

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
    console.warn(`⚠️  ${service} API approaching limit! ${remaining} calls remaining`);
  }

  return true;
}

function incrementApiCall(service) {
  apiCallTracker[service].count++;
  console.log(`📊 ${service} API calls: ${apiCallTracker[service].count}/${DAILY_LIMITS[service]}`);
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
    console.error(`Google enrichment failed for place ${place.id}:`, err.message);
    return { ...place, google: null };
  }
}

async function getAllFoodPlacesHandler(req, res) {
  try {
    const { category, cuisine, minLat, maxLat, minLon, maxLon, limit } = req.query;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : null;
    const enrich = String(req.query.enrich ?? "true").toLowerCase() !== "false";
    const places = await getAllFoodPlaces({
      category,
      cuisine,
      minLat,
      maxLat,
      minLon,
      maxLon,
      q,
      limit: limit ? parseInt(limit) : 10,
    });

    if (!enrich) {
      res.json(places);
      return;
    }

    const enriched = await Promise.all(places.map(enrichWithGoogle));
    res.json(enriched);
  } catch (error) {
    console.error("Detailed error:", error.message);
    res.status(500).json({ error: "Failed to fetch food places" });
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
    const { name, cuisine, category, latitude, longitude, address, opening_hours } = req.body;

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
    res.status(500).json({ success: false, error: "Server error when converting postcode" });
  }
}

async function searchFoodPlaces(req, res) {
  res.status(410).json({
    success: false,
    message: "Foursquare integration has been removed. Use Google Places search instead.",
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
  getFoodPlaceByIdHandler,
  searchFoodPlaces,
  getApiUsage,
  createFoodPlaceHandler,
  convertPostcodeHandler,
  getFriendsWhoVisitedHandler,
};