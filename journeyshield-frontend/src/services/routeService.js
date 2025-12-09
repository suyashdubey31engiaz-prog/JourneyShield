import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/route';


const getRoute = (startLat, startLon, endLat, endLon) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || !user.token) return Promise.reject(new Error("Not authorized"));
  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
    params: { startLat, startLon, endLat, endLon }
  };
  return axios.get(API_URL, config);
};

const routeService = {
  getRoute,
};

export default routeService;