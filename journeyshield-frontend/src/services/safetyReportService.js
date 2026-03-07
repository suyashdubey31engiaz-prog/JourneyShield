import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/safety';

const getAuth = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
};

const getSafetyReport = (city, lat, lon) => {
  if (city) return axios.get(`${API_URL}?city=${encodeURIComponent(city)}`, getAuth());
  if (lat && lon) return axios.get(`${API_URL}/current?lat=${lat}&lon=${lon}`, getAuth());
  return Promise.reject(new Error('No location provided'));
};

export default { getSafetyReport };