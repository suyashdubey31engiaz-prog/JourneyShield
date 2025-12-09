import axios from 'axios';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/places';

// Get nearby places from our backend
const getNearbyPlaces = (lat, lon) => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  // This check prevents the app from crashing
  if (!user || !user.token) {
    return Promise.reject(new Error("Not authorized: No token found."));
  }

  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
    params: { lat, lon }
  };
  return axios.get(API_URL, config);
};

const placesService = {
  getNearbyPlaces,
};

export default placesService;