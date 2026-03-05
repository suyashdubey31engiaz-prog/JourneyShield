import axios from 'axios';

// Keeps your environment variable setup
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/search';

const searchPlaces = async (query) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  // Attaches the token if the user is logged in
  const config = {
    headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {},
    params: { query }
  };
  
  // CRITICAL FIX: We added '/places' to the URL so it actually reaches the backend!
  return await axios.get(`${API_URL}/places`, config);
};

const searchService = {
  searchPlaces,
};

export default searchService;