import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';
import { trendingSpots } from '../components/explorePage/mockData';

const FindSpots = () => {
  const [searchQuery, setSearchQuery] = useState (' ');
  const [selectedLocation, setSelectedLocation] = useState(' ');
  const [selectedCuisine, setSelectedCuisine] = useState(' ');
  const [selectedPrice, setSelectedPrice] = useState(' ');

  const handleReset = () => {
    setSearchQuery(' ');
    setSelectedLocation(' ');
    setSelectedCuisine(' ');
    setSelectedPrice(' ');
  }

  return (
    <div className = "find-spots-page">
      <div className = "explore-header">
        <div className = 'flex items-center gap-3 mb-6'>
          <img src = {logo} alt = "Grumble" className = "w-12 h-12" />
          <h1 className = "text-4xl font-bold"> Find Spots</h1>
        </div>

        <div className = "flex items-center gap-3 flex-wrap"> 
          <div className = "search-bar-container">
            <Search size = {20} className = "search-icon"/>
            <input
              type = "text"
              placeholder = "Search spots..."
              value = {searchQuery}
              onChange = {(e) => setSearchQuery(e.target.value)}
              className = "search-input"
            />
          </div>

          <div className = "filter-dropdown"> 
            <select
            value = {selectedLocation}
            onChange = {(e) => setSelectedLocation(e.target.value)}
            className = "filter-select"
            > 
            {/* Change ALL the filters for every category */}
              <option value="">Location</option>
              <option value="central">Central</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="north">North</option>
              <option value="south">South</option>
            </select>
            <ChevronDown size = {16} className = "filter-icon"/>
          </div>

          <div className = "filter-dropdown">
            <select 
              value = {selectedCuisine}
              onChange = {(e) => setSelectedCuisine(e.target.value)}
              className = "filter-select"
            >
              <option value="">Cuisine</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
              <option value="korean">Korean</option>
              <option value="western">Western</option>
              <option value="italian">Italian</option>
              <option value="cafe">Cafe</option>
            </select>
            <ChevronDown size = {16} className = "filter-icon"/> 
          </div>

           <div className = "filter-dropdown">
            <select 
              value = {selectedPrice}
              onChange = {(e) => setSelectedPrice(e.target.value)}
              className = "filter-select"
            >
              <option value="">Price</option>
              <option value="$">$ (Under $15)</option>
              <option value="$$">$$ ($15-$30)</option>
              <option value="$$$">$$$ ($30-$50)</option>
              <option value="$$$$">$$$$ (Above $50)</option>
            </select>
            <ChevronDown size = {16} className = "filter-icon"/> 
          </div>

          <button onClick = {handleReset} className = "reset-button">
            Reset filters 
          </button>
        </div>
      </div>

      <div className = "trending-section">
        <h2 className = "text-3xl font-bold mb-6 text-center"> Trending Now </h2>

        <div className = "posts-grid">
          {trendingSpots.map((spot) => (
            <div key = {spot.id} className = "trending-card">
              <div className = "trending-card-image">
                <img src = {spot.image} alt = {spot.name} />
            </div>
            <h3 className = "trending-card-name"> {spot.name} </h3>
            </div>
          ))} 
        </div>
      </div> 
    </div>
  )
}

export default FindSpots;