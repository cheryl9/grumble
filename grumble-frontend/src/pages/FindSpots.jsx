import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { mockRestaurants } from '../components/findSpotsPage/mockData';
import RestaurantCard from '../components/findSpotsPage/RestaurantCard';
import { SINGAPORE_REGIONS, CUISINE_CATEGORIES, PRICE_RANGES, OCCASIONS } from '../utils/constants';
import logo from '../assets/logo.png';

const FindSpots = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    cuisine: '',
    price: '',
    occasion: ''
  });
  const [showDropdown, setShowDropdown] = useState({
    location: false,
    cuisine: false,
    price: false,
    occasion: false
  });

  const handleResetFilters = () => {
    setFilters({
      location: '',
      cuisine: '',
      price: '',
      occasion: ''
    });
    setSearchQuery('');
  };

  const toggleDropdown = (filterName) => {
    setShowDropdown(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setShowDropdown(prev => ({
      ...prev,
      [filterName]: false
    }));
  };

  // Filter restaurants based on search and filters
  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !filters.location || restaurant.location === filters.location;
    const matchesCuisine = !filters.cuisine || restaurant.cuisine === filters.cuisine;
    const matchesPrice = !filters.price || restaurant.priceRange === filters.price;
    
    return matchesSearch && matchesLocation && matchesCuisine && matchesPrice;
  });

  const trendingRestaurants = mockRestaurants.filter(r => r.rating >= 4.5);

  return (
    <div className="find-spots-page">
      {/* Header */}
      <div className="explore-header">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Grumble" className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Find spots</h1>
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
          <button onClick={() => toggleDropdown('location')} className="filter-btn">
            <span>{filters.location || 'Location'}</span>
            <ChevronDown size={16} />
          </button>
          {showDropdown.location && (
            <div className="dropdown-menu">
              {Object.entries(SINGAPORE_REGIONS).map(([region, areas]) => (
                <div key={region}>
                  <div className="dropdown-region">{region}</div>
                  {areas.map(area => (
                    <button
                      key={area}
                      onClick={() => handleFilterChange('location', area)}
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
          <button onClick={() => toggleDropdown('cuisine')} className="filter-btn">
            <span>{filters.cuisine || 'Cuisine'}</span>
            <ChevronDown size={16} />
          </button>
          {showDropdown.cuisine && (
            <div className="dropdown-menu">
              {CUISINE_CATEGORIES.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => handleFilterChange('cuisine', cuisine)}
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
          <button onClick={() => toggleDropdown('price')} className="filter-btn">
            <span>{filters.price || 'Price'}</span>
            <ChevronDown size={16} />
          </button>
          {showDropdown.price && (
            <div className="dropdown-menu">
              {PRICE_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('price', range.label)}
                  className="dropdown-item"
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Occasion Filter */}
        <div className="filter-dropdown">
          <button onClick={() => toggleDropdown('occasion')} className="filter-btn">
            <span>{filters.occasion || 'Occasion'}</span>
            <ChevronDown size={16} />
          </button>
          {showDropdown.occasion && (
            <div className="dropdown-menu">
              {OCCASIONS.map(occasion => (
                <button
                  key={occasion}
                  onClick={() => handleFilterChange('occasion', occasion)}
                  className="dropdown-item"
                >
                  {occasion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleResetFilters} className="btn-reset">
          Reset filters
        </button>
      </div>

      {/* Trending Now Section */}
      <div className="trending-section">
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <div className="restaurant-grid">
          {trendingRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>

      {/* All Results */}
      {searchQuery || Object.values(filters).some(f => f) ? (
        <div className="results-section">
          <h2 className="text-2xl font-bold mb-6">
            Results ({filteredRestaurants.length})
          </h2>
          <div className="restaurant-grid">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FindSpots;