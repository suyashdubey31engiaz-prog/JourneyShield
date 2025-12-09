import axios from 'axios';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/geocode';

const getCoordsForCity = (city) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
    params: { city }
  };
  return axios.get(API_URL, config);
};

const geocodeService = {
  getCoordsForCity,
};

export default geocodeService;