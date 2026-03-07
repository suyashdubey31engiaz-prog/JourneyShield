import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/safety';

const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return u?.token ? { headers: { Authorization: `Bearer ${u.token}` } } : {};
};

const getNearbyIncidents = (lat, lon, radiusKm = 10) =>
  axios.get(`${BASE}/incidents`, {
    params: { lat, lon, radius: radiusKm },
    ...auth(),
  });

export default { getNearbyIncidents };