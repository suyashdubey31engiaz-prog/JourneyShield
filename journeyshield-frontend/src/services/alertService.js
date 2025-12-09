
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/safety-report';

const user = JSON.parse(sessionStorage.getItem('user'));
const config = {
  // We define the header here to reuse it
  headers: { Authorization: `Bearer ${user?.token}` }
};

// Get safety report for a specific city
const getReportByCity = (city) => {
  if (!user || !user.token) return Promise.reject(new Error("Not authorized"));
  return axios.get(API_URL, { ...config, params: { city } });
};

// Get safety report for current location coordinates
const getReportByCoords = (lat, lon) => {
  if (!user || !user.token) return Promise.reject(new Error("Not authorized"));
  return axios.get(`${API_URL}/current`, { ...config, params: { lat, lon } });
};

const alertService = {
  getReportByCity,
  getReportByCoords,
};

export default alertService;