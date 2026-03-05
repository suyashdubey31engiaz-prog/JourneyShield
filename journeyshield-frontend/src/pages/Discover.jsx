import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import searchService from '../services/searchService';
import routeService from '../services/routeService';
import incidentService from '../services/incidentService';

// --- LEAFLET ICON FIX (Restores Blue/Green markers) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;
let userIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
// --- END ICON FIX ---

// Component that dynamically interacts with the map instance
const MapController = ({ center, route, onMapMove }) => {
  const map = useMap();
  
  // Update view only when the 'center' state changes explicitly (from a search)
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);

  // Update view to show the entire routing path
  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.flyToBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);

  // FEATURE: When the user finishes dragging the map, fetch new incidents/weather for that area
  useEffect(() => {
    map.on('moveend', () => {
      const newCenter = map.getCenter();
      if(onMapMove) onMapMove([newCenter.lat, newCenter.lng]);
    });
    return () => map.off('moveend'); // Cleanup on unmount
  }, [map, onMapMove]);

  return null;
};

const Discover = () => {
  // --- STATE MANAGEMENT ---
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]); // Multiple search results
  const [route, setRoute] = useState([]); // Line coordinates for the map
  const [incidents, setIncidents] = useState([]); // DB crime hotspots
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  // 1. Get User's Current Location on Start
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]); // Move map to user
        },
        (error) => { console.error("Location access denied", error); }
      );
    }
  }, []);

  // 2. FEATURE RESTORED: Fetch REAL incidents within 10km whenever the Map Center changes
  const fetchLocalSafetyData = (newCenter) => {
    if (newCenter) {
      incidentService.getNearbyIncidents(newCenter[0], newCenter[1], 10) // 10km radius
        .then(response => {
          // Triggers the display of RED circles
          setIncidents(response.data || []); 
        })
        .catch(error => { console.error("Could not fetch DB incidents:", error); });
    }
  };

  // Initial incident fetch based on user location
  useEffect(() => {
    if(mapCenter) fetchLocalSafetyData(mapCenter);
  }, [mapCenter]);

  // 3. Handle Search Submission (Find multiple Prayagrajs)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    setLoading(true);
    setRoute([]); // Clear existing routes
    setSelectedPlaceId(null);

    try {
      const response = await searchService.searchPlaces(searchTerm);
      
      // Mapped from OpenStreetMap Nominatim results
      const placesArray = response.data.results || [];
      
      // FEATURE RESTORED: Sidebar populates with multiple choices
      setPlaces(placesArray); 

      // MOVE MAP TO FIRST RESULT IMMEDIATELY
      if (placesArray.length > 0) {
        const first = placesArray[0];
        if (first.geocodes?.main) {
          setMapCenter([first.geocodes.main.latitude, first.geocodes.main.longitude]);
        }
      } else { alert("No results found."); }
    } catch (error) {
      console.error("Search failure:", error);
      alert("Search failed. Try again.");
    } finally { setLoading(false); }
  };

  // 4. FEATURE RESTORED: Calculate Route (User -> Selected Place)
  const handlePlaceClick = async (place) => {
    if (!userLocation) {
      alert("Enable location to calculate routes.");
      return;
    }

    if (!place.geocodes?.main) return;

    const dest = [place.geocodes.main.latitude, place.geocodes.main.longitude];
    setMapCenter(dest); // Move map to look at the destination
    setSelectedPlaceId(place.fsq_id || place.id);

    try {
      // Calls the OSRM Routing service
      const response = await routeService.getRoute(
        userLocation[0], userLocation[1], // Start
        dest[0], dest[1] // End
      );
      
      // FEATURE RESTORED: Draws the BLUE line path on the map
      setRoute(response.data); 
    } catch (error) {
      console.error("Routing failure:", error);
      alert("Could not create route.");
      setRoute([]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] text-white">
      
      {/* SIDEBAR */}
      <div className="w-1/3 bg-gray-900/90 p-6 overflow-y-auto border-r border-gray-700">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Discover Places</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input 
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search e.g. 'Prayagraj Museums'"
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md py-2 px-3 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 outline-none"
          />
          <button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-md disabled:opacity-50">
            {loading ? '...' : 'Go'}
          </button>
        </form>

        <div className="space-y-4">
          {places.length === 0 && !loading && (
            <p className="text-gray-500 text-center mt-10">Search for a location to see places and safety alerts.</p>
          )}
          
          {places.map((place) => (
            <div 
              key={place.fsq_id || place.id} 
              onClick={() => handlePlaceClick(place)} 
              className={`bg-gray-800 p-4 rounded-lg border cursor-pointer hover:border-yellow-400 hover:bg-gray-750 transition-all ${(selectedPlaceId === (place.fsq_id || place.id)) ? 'border-yellow-400 ring-2 ring-yellow-500' : 'border-gray-700'}`}
            >
              <h3 className="font-semibold text-lg text-gray-100">{place.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{place.location?.formatted_address || "Address unavailable"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="w-2/3 h-full relative">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          
          {/* Controls view movements and triggers incident fetches on moves */}
          <MapController center={mapCenter} route={route} onMapMove={fetchLocalSafetyData} />

          {/* 1. Green Marker for User */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Tooltip direction="top" offset={[0, -20]}>You are here</Tooltip>
            </Marker>
          )}

          {/* 2. FEATURE RESTORED: Multiple Blue Markers for ALL Search Results */}
          {places.map(place => {
            if (!place.geocodes?.main) return null; // Skip if no coords
            return (
              <Marker 
                key={place.fsq_id || place.id} 
                position={[place.geocodes.main.latitude, place.geocodes.main.longitude]}
                eventHandlers={{ click: () => handlePlaceClick(place) }} // Clicking marker starts routing
              >
                <Tooltip direction="top">{place.name}</Tooltip>
              </Marker>
            );
          })}

          {/* 3. FEATURE RESTORED: Red Circles for nearby DB Incidents (10km range) */}
          {incidents && incidents.length > 0 && incidents.map(incident => (
            <CircleMarker 
              key={incident._id} 
              // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
              center={[incident.location.coordinates[1], incident.location.coordinates[0]]} 
              pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.6, weight: 1 }}
              radius={12} // The visual radius on map
            >
              <Popup>
                <div className="text-gray-800 min-w-[150px]">
                  <h4 className="font-bold text-red-600 uppercase text-xs mb-1">{incident.type}</h4>
                  <p className="text-sm font-medium mb-1">{incident.description}</p>
                  <p className="text-xs text-gray-500 border-t pt-1 mt-1">Severity: {incident.severity}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* 4. FEATURE RESTORED: The actual blue Route Line path */}
          {route && route.length > 0 && (
            <Polyline pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8 }} positions={route} />
          )}

        </MapContainer>
        
        {/* Map Legend */}
        <div className="absolute bottom-5 right-5 bg-gray-900/80 p-3 rounded-lg border border-gray-600 text-xs text-white z-[1000]">
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-green-500 block"></span> You</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-blue-500 block"></span> Places</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 block"></span> Incident/Crime</div>
        </div>

      </div>
    </div>
  );
};

export default Discover;