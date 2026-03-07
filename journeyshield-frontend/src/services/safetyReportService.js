import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/safety';

const getSafetyReport = async (city, lat, lon) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const config = {
    headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {},
  };

  if (city) {
    return await axios.get(`${API_URL}?city=${city}`, config);
  } else if (lat && lon) {
    return await axios.get(`${API_URL}/current?lat=${lat}&lon=${lon}`, config);
  }

  throw new Error('No location provided');
};

export default { getSafetyReport };