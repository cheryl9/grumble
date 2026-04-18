import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import api from "../services/api";
import RestaurantCard from "../components/findSpotsPage/RestaurantCard";
import {
  SINGAPORE_REGIONS,
  CUISINE_CATEGORIES,
  PRICE_RANGES,
} from "../utils/constants";
import { getAreaFromCoordinates } from "../utils/postalCodeMapper";
import logo from "../assets/logo.png";

const FindSpots = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    cuisine: "",
    price: "",
  });
  const [showDropdown, setShowDropdown] = useState({
    location: false,
    cuisine: false,
    price: false,
  });

  const [allRestaurants, setAllRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedCount, setDisplayedCount] = useState(9);

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Don't filter by cuisine on the backend - fetch all and filter on frontend
        const params = {};
        const res = await api.get("/food-places", { params });

        const normalized = (res.data || []).map((p) => {
          const priceLevel = p.google?.priceLevel;
          const priceRange = priceLevel ? "$".repeat(priceLevel) : "-";
          // Determine area from coordinates - convert to numbers
          const lat = p.lat ? Number(p.lat) : null;
          const lon = p.lon ? Number(p.lon) : null;
          const locationArea =
            lat && lon ? getAreaFromCoordinates(lat, lon) : null;

          return {
            id: p.id,
            name: p.name || "Unknown place",
            cuisine: p.cuisine || "Unknown",
            category: p.category || "",
            location: p.google?.address || p.address || "Address unavailable",
            locationArea: locationArea || "Unknown",
            openingHours:
              p.google?.openingHours || p.opening_hours || "Not available",
            image: p.google?.image || p.image_url || null,
            priceRange: priceRange,
            priceLevel: priceLevel,
            rating: p.google?.rating != null ? Number(p.google.rating) : null,
            reviewCount:
              p.google?.reviewCount != null
                ? Number(p.google.reviewCount)
                : null,
            website: p.website || null,
            lat: lat,
            lon: lon,
            googleData: p.google || null,
          };
        });

        const curated = normalized
          .filter((r) => {
            const hasKnownName =
              r.name &&
              r.name.toLowerCase() !== "unknown" &&
              r.name.toLowerCase() !== "unknown place";
            const hasAnyUsefulMeta =
              r.location !== "Address unavailable" ||
              r.openingHours !== "Not available" ||
              r.website ||
              r.image ||
              r.rating != null;
            return hasKnownName && hasAnyUsefulMeta;
          })
          .sort((a, b) => {
            const score = (x) =>
              (x.image ? 1 : 0) +
              (x.rating != null ? 1 : 0) +
              (x.location !== "Address unavailable" ? 1 : 0) +
              (x.website ? 1 : 0);

            return score(b) - score(a);
          });

        // Debug: log all unique cuisines with coordinates
        const uniqueCuisines = [...new Set(curated.map((r) => r.cuisine))];
        console.log("🍽️ Unique cuisines in database:", uniqueCuisines);
        console.log("📊 Total restaurants:", curated.length);
        curated.forEach((r) => {
          console.log(
            `${r.name} - Cuisine: ${r.cuisine}, Area: ${r.locationArea}, Coords: (${r.lat}, ${r.lon})`,
          );
        });

        setAllRestaurants(curated);
      } catch (err) {
        console.error("Failed to fetch food places:", err);
        setError("Could not load restaurants. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const handleResetFilters = () => {
    setFilters({
      location: "",
      cuisine: "",
      price: "",
    });
    setSearchQuery("");
    setDisplayedCount(9);
  };

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + 9);
  };

  const toggleDropdown = (filterName) => {
    setShowDropdown((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setShowDropdown((prev) => ({
      ...prev,
      [filterName]: false,
    }));
  };

  const filteredRestaurants = allRestaurants.filter((restaurant) => {
    // Match search query
    const matchesSearch = restaurant.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Match location filter - directly match the area
    const matchesLocation =
      !filters.location ||
      (restaurant.locationArea &&
        restaurant.locationArea.toLowerCase() ===
          filters.location.toLowerCase());

    // Match cuisine filter
    const matchesCuisine =
      !filters.cuisine ||
      restaurant.cuisine?.toLowerCase() === filters.cuisine.toLowerCase();

    // Match price filter - compare the $ count with priceLevel
    let matchesPrice = true;
    if (filters.price) {
      const selectedPriceLength = filters.price.length; // "$" = 1, "$$" = 2, "$$$" = 3
      matchesPrice = restaurant.priceRange.length === selectedPriceLength;
    }

    return matchesSearch && matchesLocation && matchesCuisine && matchesPrice;
  });

  // Apply same filters to trending restaurants
  const trendingRestaurants = filteredRestaurants
    .filter((r) => r.rating != null)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 9);

  const fallbackTrending =
    trendingRestaurants.length > 0
      ? trendingRestaurants
      : filteredRestaurants.slice(0, 9);

  // Paginated results
  const paginatedResults = filteredRestaurants.slice(0, displayedCount);

  return (
    <div className="find-spots-page">
          {/* Header */}
          <div className="explore-header">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Grumble" className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">Find Spots</h1>
                <p className="explore-subtitle">
                  Discover trending and nearby food spots.
                </p>
              </div>
            </div>
          </div>

      {/* Search and Filters Bar */}
      <div className="search-filter-bar">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search spots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Location Filter */}
        <div className="filter-dropdown">
          <button
            onClick={() => toggleDropdown("location")}
            className="filter-btn"
          >
            <span>{filters.location || "Location"}</span>
            <ChevronDown size={16} />
          </button>
          {showDropdown.location && (
            <div className="dropdown-menu">
              {Object.entries(SINGAPORE_REGIONS).map(([region, areas]) => (
                <div key={region}>
                  <div className="dropdown-region">{region}</div>
                  {areas.map((area) => (
                    <button
                      key={area}
                      onClick={() => handleFilterChange("location", area)}
                      className="dropdown-item"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cuisine Filter */}
        <div className="filter-dropdown">
          <button
            onClick={() => toggleDropdown("cuisine")}
            className="filter-btn"
          >
            <span>{filters.cuisine || "Cuisine"}</span>
            <ChevronDown size={16} />
          </button>
          {showDropdown.cuisine && (
            <div className="dropdown-menu">
              {CUISINE_CATEGORIES.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleFilterChange("cuisine", cuisine)}
                  className="dropdown-item"
                >
                  {cuisine}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="filter-dropdown">
          <button
            onClick={() => toggleDropdown("price")}
            className="filter-btn"
          >
            <span>{filters.price || "Price"}</span>
            <ChevronDown size={16} />
          </button>
          {showDropdown.price && (
            <div className="dropdown-menu">
              <button
                onClick={() => handleFilterChange("price", "$")}
                className="dropdown-item"
              >
                $ (Budget-Friendly)
              </button>
              <button
                onClick={() => handleFilterChange("price", "$$")}
                className="dropdown-item"
              >
                $$ (Moderate)
              </button>
              <button
                onClick={() => handleFilterChange("price", "$$$")}
                className="dropdown-item"
              >
                $$$ (Expensive)
              </button>
            </div>
          )}
        </div>

        <button onClick={handleResetFilters} className="btn-reset">
          Reset filters
        </button>
      </div>

      {/* CHANGED: loading and error states */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <p className="text-gray-400">Loading spots...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Trending Now Section */}
      {!isLoading && !error && (
        <div className="trending-section">
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          {fallbackTrending.length > 0 ? (
            <div className="restaurant-grid">
              {fallbackTrending.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No trending spots yet.</p>
          )}
        </div>
      )}

      {/* All Results */}
      {!isLoading && !error && (
        <div className="results-section">
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery || Object.values(filters).some((f) => f)
              ? `Results (${filteredRestaurants.length})`
              : `All Spots (${filteredRestaurants.length})`}
          </h2>
          <div className="restaurant-grid">
            {paginatedResults.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {/* Load More Button */}
          {displayedCount < filteredRestaurants.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-semibold transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindSpots;
