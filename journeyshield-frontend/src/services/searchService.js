import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/search';

const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return u?.token ? { headers: { Authorization: `Bearer ${u.token}` } } : {};
};

/**
 * Geocode a place name → { lat, lon, displayName, city, boundingBox }
 */
const geocodeLocation = (q) =>
  axios.get(`${BASE}/geocode`, { params: { q }, ...auth() });

/**
 * Nearby POI search
 * @param {number}  lat
 * @param {number}  lon
 * @param {object}  options - { radius, query, category }
 */
const searchNearbyPlaces = (lat, lon, options = {}) =>
  axios.get(`${BASE}/places`, {
    params: { lat, lon, ...options },
    ...auth(),
  });

/**
 * Route between two points → [[lat,lon], ...]
 */
const getRoute = (startLat, startLon, endLat, endLon) =>
  axios.get(`${BASE}/route`, {
    params: { startLat, startLon, endLat, endLon },
    ...auth(),
  });

const searchService = { geocodeLocation, searchNearbyPlaces, getRoute };
export default searchService;