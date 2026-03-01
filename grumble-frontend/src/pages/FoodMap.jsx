import React, { useState, useEffect, useRef } from 'react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockPins } from '../components/foodMapPage/mockData';
import logo from '../assets/logo.png';
import { Users, User, Bookmark } from 'lucide-react';

const TABS = [
  { key: "self", label: "Self", icon: <User size={16} /> },
  { key: "friends", label: "Friends", icon: <Users size={16} /> },
  { key: "saved", label: "Saved", icon: <Bookmark size={16} /> },
];

  // this is to create pins, but for now is just a placeholder instead of the customised avatars
function createPinIcon(pin, isSelected = false) {
  const color = '#F78660';
  const size = isSelected ? 52 : 42;
  const imgSize = size - 10;

  const avatarHtml = pin.avatarUrl ? 
    `<img
      src="${pin.avatarUrl}"
      style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;object-fit:cover;"
    />` : 
    `<div style="
      width:${imgSize}px;height:${imgSize}px;
      border-radius:50%;
      background:#FCF1DD;
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(imgSize * 0.45)}px;
      font-weight:800;
      color:#F78660;
    ">${pin.friend ? pin.friend[0].toUpperCase() : 'Me'}</div>`;
    
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
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

const FoodMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [activeTab, setActiveTab] = useState('self');
  const [selectedPin, setSelectedPin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: '', note: '', rating: 5 });

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12, 
      zoomControl: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    L.control.zoom({ position: 'topright'}).addTo(map);
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null };
  }, [])

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    mockPins[activeTab].forEach((pin) => {
      const isSelected = selectedPin?.id === pin.id;
      const marker = L.marker([pin.lat, pin.lng], {
        icon: createPinIcon(pin, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(mapRef.current);

      marker.on('click', () => {
        setSelectedPin((prev) => (prev?.id === pin.id ? null : pin));
        mapRef.current.flyTo([pin.lat, pin.lng], Math.max(mapRef.current.getZoom(), 14), 
        { duration: 0.6 });
      })

      markersRef.current.push(marker);
    });
  }, [activeTab, selectedPin]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedPin(null);
    mapRef.current?.flyTo([1.3521, 103.8198], 12, { duration: 0.8 });
  };

  const handleAddSpot = () => {
    if (!newSpot.name.trim()) return;
    alert(`"${newSpot.name}" pinned!\n(Wire this to your backend API to persist.)`);
    setShowAddModal(false);
    setNewSpot({ name: '', note: '', rating: 5 });
  };

  return (
    <div className="food-map-page flex flex-col overflow-hidden" style={{ height: '100dvh' }}>

      {/* Header */}
      <div className="explore-header">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Grumble" className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Food Map</h1>
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
                  active ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
            >
                <span className={active ? 'text-gray-700' : 'text-gray-400'}>
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

        {/* Pin detail card */}
        {selectedPin && (
          <div className="map-pin-card absolute bottom-24 left-1/2 z-[1000] w-80" style={{ transform: 'translateX(-50%)' }}>
            <div className="h-1.5 rounded-t-2xl bg-[#F78660]" />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 bg-[#FCF1DD] text-[#F78660]">
                  {selectedPin.friend ? selectedPin.friend[0].toUpperCase() : 'Me'}
                </div>
                <div className="flex-1 min-w-0">
                  {selectedPin.friend && (
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">📌 {selectedPin.friend}</p>
                  )}
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{selectedPin.name}</h3>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} className={i <= selectedPin.rating ? 'star-filled' : 'star-empty'}>★</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0 transition-colors"
                >✕</button>
              </div>
              <p className="mt-2.5 text-sm text-gray-500 italic">"{selectedPin.note}"</p>
              <button className="btn-primary mt-3 w-full py-2.5 rounded-xl text-sm">
                See post →
              </button>
            </div>
          </div>
        )}

        {/* Add food spot button */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000]">
          <button onClick={() => setShowAddModal(true)} className="map-cta-btn flex items-center gap-2 px-7 py-3.5 text-[15px]">
            <span className="text-xl">⊕</span>
            Add food spot
          </button>
        </div>
      </div>

      {/* Add Spot Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center overflow-hidden"
          onClick={() => setShowAddModal(false)}
        >
          <div className="map-bottom-sheet w-full max-w-sm p-6 pb-50 shadow-2xl h-fit rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-900">Pin a food spot</h2>
            <p className="text-sm text-gray-400 font-medium mb-5">Share where you ate at</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Place Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maxwell Food Centre"
                  value={newSpot.name}
                  onChange={(e) => setNewSpot({ ...newSpot, name: e.target.value })}
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewSpot({ ...newSpot, rating: star })}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= newSpot.rating ? 'star-filled' : 'star-empty'}`}
                    >★</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Note</label>
                <input
                  type="text"
                  placeholder="How was this place?"
                  value={newSpot.note}
                  onChange={(e) => setNewSpot({ ...newSpot, note: e.target.value })}
                  className="input-field bg-gray-50"
                />
              </div>

              <button
                onClick={handleAddSpot}
                disabled={!newSpot.name.trim()}
                className="btn-primary w-full py-3.5 rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Pin it! 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMap;