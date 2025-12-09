import axios from 'axios';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/search';

const searchPlaces = (query) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || !user.token) {
    return Promise.reject(new Error("Not authorized"));
  }
  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
    params: { query }
  };
  return axios.get(API_URL, config);
};

const searchService = {
  searchPlaces,
};

export default searchService;