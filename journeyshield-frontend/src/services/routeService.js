import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/search';

const getRoute = async (startLat, startLon, endLat, endLon) => {
  const response = await axios.get(`${API_URL}/route`, {
    params: { startLat, startLon, endLat, endLon },
  });
  return { data: response.data };
};

export default { getRoute };