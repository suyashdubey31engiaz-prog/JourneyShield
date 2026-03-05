import axios from 'axios';

// Must explicitly point to your backend port 5000
const API_URL = 'http://localhost:5000/api/safety'; 

const getNearbyIncidents = async (lat, lon, radiusKm = 10) => {
  // Grab the logged-in user's token for security
  const user = JSON.parse(sessionStorage.getItem('user'));
  const config = {
    headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {},
    params: { lat, lon, radius: radiusKm }
  };
  
  // Note: We are hitting the REAL incident endpoint: http://localhost:5000/api/safety/incidents
  return await axios.get(`${API_URL}/incidents`, config);
};

export default { getNearbyIncidents };