const {
  getAllFoodPlaces,
  getFoodPlaceById,
} = require("../repositories/foodPlaceRepository");
const { getGoogleData } = require("../services/googlePlacesService");

// ========== RATE LIMITING & CACHING ==========
// Track API calls to prevent exceeding limits
const apiCallTracker = {
  google: { count: 0, resetTime: Date.now() + 86400000 }, // Daily limit
};

const DAILY_LIMITS = {
  google: 10, // Limited to prevent excessive API charges
};

// Simple in-memory cache (use Redis in production)
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour in ms

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

  // Warn if approaching limit
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
    // 1. Check in-memory cache
    const cacheKey = getCacheKey("google", place.name, place.lat, place.lon);
    const cached = getFromCache(cacheKey);
    if (cached) return { ...place, google: cached };

    // 2. Check API limit
    if (!canMakeApiCall("google")) {
      console.log("❌ Google API limit reached, skipping enrichment");
      return { ...place, google: null };
    }

    // 3. Hit Google API
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
    const { category, cuisine, minLat, maxLat, minLon, maxLon, limit } =
      req.query;
    const places = await getAllFoodPlaces({
      category,
      cuisine,
      minLat,
      maxLat,
      minLon,
      maxLon,
      limit: limit ? parseInt(limit) : 10,
    });
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

async function searchFoodPlaces(req, res) {
  res.status(410).json({
    success: false,
    message:
      "Foursquare integration has been removed. Use Google Places search instead.",
  });
}

// Endpoint to check current API usage
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

module.exports = {
  getAllFoodPlacesHandler,
  getFoodPlaceByIdHandler,
  searchFoodPlaces,
  getApiUsage,
};
