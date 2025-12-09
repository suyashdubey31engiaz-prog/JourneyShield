import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import searchService from '../services/searchService';
import routeService from '../services/routeService';
import incidentService from '../services/incidentService'; // Import the new incident service

// --- LEAFLET ICON FIX ---
// This fixes the issue where markers don't show up in React Leaflet by default
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icon for the "User's Location" to distinguish it from search results
let userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
// --- END ICON FIX ---

// Component to programmatically move the map view
const MapController = ({ center, route }) => {
  const map = useMap();
  useEffect(() => {
    if (route && route.length > 0) {
      // If a route exists, zoom to fit the whole path
      const bounds = L.latLngBounds(route);
      map.flyToBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      // Otherwise, just fly to the specific center point
      map.flyTo(center, 13);
    }
  }, [center, route, map]);
  return null;
};

const Discover = () => {
  // State Management
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: Center of India
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [route, setRoute] = useState([]);
  const [incidents, setIncidents] = useState([]); // Store crime/safety incidents
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Get User's Current Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Optional: Set a default fallback location if GPS is denied
        }
      );
    }
  }, []);

  // 2. Fetch Safety Incidents whenever the Map Center changes
  // This ensures that if you search for "Delhi", you see incidents in Delhi, not just where you are.
  useEffect(() => {
    if (mapCenter) {
      incidentService.getNearbyIncidents(mapCenter[0], mapCenter[1], 15) // 15km radius
        .then(response => {
          setIncidents(response.data);
        })
        .catch(error => {
          console.error("Failed to fetch incidents:", error);
        });
    }
  }, [mapCenter]);

  // 3. Handle Search Submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    setLoading(true);
    setPlaces([]);
    setRoute([]);

    try {
      const response = await searchService.searchPlaces(searchTerm);
      setPlaces(response.data);

      // If results found, move map to the first result
      if (response.data.length > 0) {
        const firstPlace = response.data[0];
        setMapCenter([
          firstPlace.geocodes.main.latitude, 
          firstPlace.geocodes.main.longitude
        ]);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Calculate Route on Place Click
  const handlePlaceClick = async (place) => {
    if (!userLocation) {
      alert("Please enable location services to calculate a route.");
      return;
    }

    const destination = [place.geocodes.main.latitude, place.geocodes.main.longitude];
    
    // Optimistically move map to destination immediately
    setMapCenter(destination);

    try {
      const response = await routeService.getRoute(
        userLocation[0], 
        userLocation[1], 
        destination[0], 
        destination[1]
      );
      setRoute(response.data);
    } catch (error) {
      console.error("Routing error:", error);
      alert("Could not calculate a route.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]"> {/* Adjust height based on Navbar */}
      
      {/* SIDEBAR: Search & Results */}
      <div className="w-1/3 bg-gray-900/90 p-6 overflow-y-auto border-r border-gray-700">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Discover Places</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search e.g. 'Museums in Delhi'"
            className="flex-grow bg-gray-800 border border-gray-600 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Go'}
          </button>
        </form>

        <div className="space-y-4">
          {places.length === 0 && !loading && (
            <p className="text-gray-500 text-center mt-10">Search for a location to see places and safety alerts.</p>
          )}
          
          {places.map((place) => (
            <div 
              key={place.id} 
              onClick={() => handlePlaceClick(place)} 
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-pointer hover:border-yellow-400 hover:bg-gray-750 transition-all"
            >
              <h3 className="font-semibold text-lg text-gray-100">{place.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{place.location.formatted_address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="w-2/3 h-full relative">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }} 
          zoomControl={false}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; OpenStreetMap contributors' 
          />
          
          {/* Controls Map Movement */}
          <MapController center={mapCenter} route={route} />

          {/* 1. User Location Marker (Green) */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                You are here
              </Tooltip>
            </Marker>
          )}

          {/* 2. Search Result Markers (Blue) */}
          {places.map(place => (
            <Marker 
              key={place.id} 
              position={[place.geocodes.main.latitude, place.geocodes.main.longitude]}
              eventHandlers={{
                click: () => handlePlaceClick(place),
              }}
            >
              <Tooltip direction="top" className="permanent-tooltip">
                {place.name}
              </Tooltip>
            </Marker>
          ))}

          {/* 3. Safety Incident Markers (Red Circles) */}
          {incidents.map(incident => (
            <CircleMarker 
              key={incident._id} 
              center={[incident.location.coordinates[1], incident.location.coordinates[0]]} // GeoJSON is [lon, lat], Leaflet needs [lat, lon]
              pathOptions={{ 
                color: 'red', 
                fillColor: '#ef4444', 
                fillOpacity: 0.6, 
                weight: 1 
              }}
              radius={12} // Size of the crime hotspot
            >
              <Popup>
                <div className="text-gray-800 min-w-[150px]">
                  <h4 className="font-bold text-red-600 uppercase text-xs mb-1">{incident.type}</h4>
                  <p className="text-sm font-medium mb-1">{incident.description}</p>
                  <div className="text-xs text-gray-500 border-t pt-1 mt-1 flex justify-between">
                    <span>Severity: {incident.severity}</span>
                    <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* 4. Route Line (Blue Path) */}
          {route.length > 0 && (
            <Polyline 
              pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8 }} 
              positions={route} 
            />
          )}

        </MapContainer>
        
        {/* Map Legend Overlay */}
        <div className="absolute bottom-5 right-5 bg-gray-900/80 p-3 rounded-lg border border-gray-600 text-xs text-white z-[1000]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-green-500 block"></span> You
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 block"></span> Places
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 block"></span> Incident/Crime
          </div>
        </div>

      </div>
    </div>
  );
};

export default Discover;