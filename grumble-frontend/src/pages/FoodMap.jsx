import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import logo from "../assets/logo.png";
import { Users, User, Bookmark } from "lucide-react";
import { getAvatarSrc } from "../utils/avatarUtils";
import AddFoodSpotModal from "../components/foodMapPage/AddFoodSpotModal";

const TABS = [
  { key: "self", label: "Self", icon: <User size={16} /> },
  { key: "friends", label: "Friends", icon: <Users size={16} /> },
  { key: "saved", label: "Saved", icon: <Bookmark size={16} /> },
];

// simplified pin icon — no user avatar data from food-places endpoint
// when posts backend exists, pass user avatar in pin.avatarUrl and it'll render
function createPinIcon(pin, isSelected = false) {
  const color = "#F78660";
  const size = isSelected ? 52 : 42;
  const imgSize = size - 10;

  const avatarHtml = pin.avatarUrl
    ? `<img src="${pin.avatarUrl}" style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;object-fit:cover;" />`
    : `<div style="
        width:${imgSize}px;height:${imgSize}px;
        border-radius:50%;
        background:#FCF1DD;
        display:flex;align-items:center;justify-content:center;
        font-size:${Math.round(imgSize * 0.35)}px;
        font-weight:800;
        color:#F78660;
      ">🍴</div>`;

  const html = `
    <div style="position:relative;width:${size}px;height:${size + 8}px;display:flex;flex-direction:column;align-items:center;">
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
        flex-shrink:0;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-64%);
        pointer-events:none;
      ">${avatarHtml}</div>
    </div>`;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

// Fetch food places (used for the default/all-places view on 'self' tab fallback)
async function fetchPlacesInBounds(bounds) {
  const { _southWest: sw, _northEast: ne } = bounds;
  const res = await api.get("/food-places", {
    params: {
      minLat: sw.lat,
      maxLat: ne.lat,
      minLon: sw.lng,
      maxLon: ne.lng,
    },
  });
  return res.data;
}

// Fetch posts and extract pins with lat/lon from their linked food_place
// tab maps directly to the posts feed tab param
async function fetchPostPins(tab) {
  const res = await api.get("/posts", { params: { tab } });
  // Only keep posts that have a food place with coordinates
  return res.data
    .filter((p) => p.food_place_id && p.lat != null && p.lon != null)
    .map((p) => ({
      id: p.id,
      lat: p.lat,
      lon: p.lon,
      name: p.place_name || p.location_name || "Unnamed place",
      cuisine: p.cuisine,
      category: p.category,
      rating: p.rating,
      description: p.description,
      username: p.username,
      liked_by_me: p.liked_by_me,
      likes_count: p.likes_count,
      created_at: p.created_at, // Added for date filtering (Friends tab)
      avatarUrl: p.equipped_avatar ? getAvatarSrc(p.equipped_avatar) : null,
      isPost: true, // flag so pin card knows it's a post, not a bare place
    }));
}

const FoodMap = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [activeTab, setActiveTab] = useState("self");
  const [selectedPin, setSelectedPin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [spotCoords, setSpotCoords] = useState(null);

  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  // Ref so the moveend listener always reads the current tab without needing re-registration
  const activeTabRef = useRef("self");

  // Fetch logic depends on active tab:
  // 'self'    → user's own posts (mine tab on posts API)
  // 'friends' → friends' posts from past 3 months (friends tab on posts API)
  // 'saved'   → saved posts (saved tab on posts API)
  // NOTE: Each tab shows ONLY the intended data, empty if none exist
  const loadAndRenderMarkers = useCallback(async (tab = "self") => {
    if (!mapRef.current) return;
    setIsLoadingPlaces(true);
    try {
      let data;
      if (tab === "self") {
        // My posts pinned on the map (no fallback - show empty if no posts)
        data = await fetchPostPins("mine");
      } else if (tab === "friends") {
        // Friends' posts from past 3 months
        data = await fetchPostPins("friends");

        // Filter to only show posts from past 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        data = data.filter((p) => {
          const postDate = new Date(p.created_at);
          return postDate >= threeMonthsAgo;
        });
      } else if (tab === "saved") {
        // Saved posts only
        const res = await api.get("/posts/saved");
        data = res.data
          .filter((p) => p.lat != null && p.lon != null)
          .map((p) => ({
            id: p.id,
            lat: p.lat,
            lon: p.lon,
            name: p.place_name || p.location_name || "Unnamed place",
            cuisine: p.cuisine,
            category: p.category,
            rating: p.rating,
            description: p.description,
            username: p.username,
            liked_by_me: p.liked_by_me,
            likes_count: p.likes_count,
            avatarUrl: p.equipped_avatar
              ? getAvatarSrc(p.equipped_avatar)
              : null,
            isPost: true,
          }));
      }
      setPlaces(data);
    } catch (err) {
      console.error("Failed to fetch map pins:", err);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  // map init — attach moveend to re-fetch on pan/zoom
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
        attribution: '© <a href="https://carto.com/">CARTO</a>',
      },
    ).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;

    // Fetch on ready; moveend reads activeTabRef so it always uses the current tab
    map.whenReady(() => loadAndRenderMarkers("self"));
    const onMoveEnd = () => loadAndRenderMarkers(activeTabRef.current);
    map.on("moveend", onMoveEnd);

    return () => {
      map.off("moveend", onMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, [loadAndRenderMarkers]);

  // CHANGED: render markers from real places data instead of mockPins
  // NOTE: self/friends/saved tabs don't have different data yet — that needs the posts backend
  // all tabs show the same place markers for now; replace places with user-filtered data later
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      // food_places rows have lat/lon columns (not lat/lng)
      const isSelected = selectedPin?.id === place.id;
      const marker = L.marker([place.lat, place.lon], {
        icon: createPinIcon(place, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(mapRef.current);

      marker.on("click", () => {
        setSelectedPin((prev) => (prev?.id === place.id ? null : place));
        mapRef.current.flyTo(
          [place.lat, place.lon],
          Math.max(mapRef.current.getZoom(), 14),
          {
            duration: 0.6,
          },
        );
      });

      markersRef.current.push(marker);
    });
  }, [places, selectedPin]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    activeTabRef.current = tab;
    setSelectedPin(null);
    mapRef.current?.flyTo([1.3521, 103.8198], 12, { duration: 0.8 });
    loadAndRenderMarkers(tab);
  };

  return (
    <div
      className="food-map-page flex flex-col overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* Header */}
      <div className="explore-header">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Grumble" className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold">Food Map</h1>
            <p className="explore-subtitle">
              Pin all your favourite food spots in one place.
            </p>
          </div>
        </div>
      </div>
      {/* Tab Bar */}
      <div className="absolute top-30 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="flex items-center gap-1 bg-white rounded-full shadow-lg px-2 py-2">
          {TABS.map(({ key, label, icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex items-center justify-center w-12 h-10 rounded-full transition-all duration-200 ${
                  active ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <span className={active ? "text-gray-700" : "text-gray-400"}>
                  {icon}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 overflow-hidden">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* CHANGED: loading indicator for place fetches */}
        {isLoadingPlaces && (
          <div className="absolute top-4 right-16 z-[1000] bg-white rounded-full px-3 py-1 text-sm text-gray-500 shadow">
            Loading...
          </div>
        )}

        {/* Pin detail card — CHANGED: uses place fields (name, cuisine, category) instead of mock pin fields */}
        {selectedPin && (
          <div
            className="map-pin-card absolute bottom-24 left-1/2 z-[1000] w-80"
            style={{ transform: "translateX(-50%)" }}
          >
            <div className="h-1.5 rounded-t-2xl bg-[#F78660]" />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 bg-[#FCF1DD] text-[#F78660]">
                  {selectedPin.username
                    ? selectedPin.username[0].toUpperCase()
                    : "🍴"}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Show username if it's a post pin */}
                  {selectedPin.username && (
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">
                      📌 {selectedPin.username}
                    </p>
                  )}
                  {/* Show cuisine/category for bare place pins */}
                  {!selectedPin.username &&
                    (selectedPin.cuisine || selectedPin.category) && (
                      <p className="text-xs text-gray-400 font-semibold mb-0.5">
                        {selectedPin.cuisine || selectedPin.category}
                      </p>
                    )}
                  <h3 className="font-bold text-gray-900 text-base leading-tight">
                    {selectedPin.name || "Unnamed place"}
                  </h3>
                  {/* Star rating for posts */}
                  {selectedPin.rating && (
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={
                            i <= selectedPin.rating
                              ? "star-filled"
                              : "star-empty"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedPin.address && !selectedPin.isPost && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedPin.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0 transition-colors"
                >
                  ✕
                </button>
              </div>
              {/* Show post description or opening hours */}
              {selectedPin.description && (
                <p className="mt-2.5 text-sm text-gray-500 italic">
                  "{selectedPin.description}"
                </p>
              )}
              {!selectedPin.description && selectedPin.opening_hours && (
                <p className="mt-2.5 text-sm text-gray-500 italic">
                  "{selectedPin.opening_hours}"
                </p>
              )}
              <button
                onClick={() =>
                  navigate("/explore", {
                    state: { selectedPostId: selectedPin.id },
                  })
                }
                className="btn-primary mt-3 w-full py-2.5 rounded-xl text-sm"
              >
                See post →
              </button>
            </div>
          </div>
        )}

        {/* Add food spot button */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={() => setShowAddModal(true)}
            className="map-cta-btn flex items-center gap-2 px-7 py-3.5 text-[15px]"
          >
            <span className="text-xl">⊕</span>
            Add food spot
          </button>
        </div>
      </div>

      {/* Add Spot Modal */}
      {showAddModal && (
        <AddFoodSpotModal
          onClose={() => setShowAddModal(false)}
          onSpotAdded={() => {
            setShowAddModal(false);
            loadAndRenderMarkers("self");
          }}
          lat={spotCoords?.lat || 1.3521}
          lon={spotCoords?.lon || 103.8198}
        />
      )}
    </div>
  );
};

export default FoodMap;
