import api from "./api";

const priceLevelToRangeLabel = (priceLevel) => {
  // Price levels are 1-4.
  switch (priceLevel) {
    case 1:
      return "$0 - $10";
    case 2:
      return "$10 - $20";
    case 3:
      return "$20 - $30";
    case 4:
      return "$30 and above";
    default:
      return "Not available";
  }
};

const normalizeFoodPlace = (p) => ({
  id: p.id,
  name: p.name || "Unknown place",
  cuisine: p.cuisine || "Unknown",
  category: p.category || "",
  location: p.address || "Address unavailable",
  openingHours: p.opening_hours || "Not available",
  image: p.photo_url || null,
  priceRange:
    p.price_level != null
      ? priceLevelToRangeLabel(Number(p.price_level))
      : "Not available",
  rating: p.rating != null ? Number(p.rating) : null,
  phone: p.phone || null,
  website: p.website || null,
  lat: p.lat,
  lon: p.lon,
});

export async function getFoodPlaces({ cuisine } = {}) {
  const params = {};
  if (cuisine) params.cuisine = String(cuisine).toLowerCase();

  const res = await api.get("/food-places", { params });
  return (res.data || []).map(normalizeFoodPlace);
}
