import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/safety';

const getNearbyIncidents = async (lat, lon, radiusKm = 10) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const config = {
    headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {},
    params: { lat, lon, radius: radiusKm },
  };
  return await axios.get(`${API_URL}/incidents`, config);
};

export default { getNearbyIncidents };