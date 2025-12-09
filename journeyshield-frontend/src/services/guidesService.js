import axios from 'axios';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/guides/';

const getAuth = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || !user.token) return null;
  return { headers: { Authorization: `Bearer ${user.token}` } };
};

const getGuides = () => {
  const config = getAuth();
  if (!config) return Promise.reject(new Error("Not authorized"));
  return axios.get(API_URL, config);
};

const getMyProfile = () => {
  const config = getAuth();
  if (!config) return Promise.reject(new Error("Not authorized"));
  return axios.get(API_URL + 'me', config);
};

const updateProfile = (profileData) => {
  const config = getAuth();
  if (!config) return Promise.reject(new Error("Not authorized"));
  return axios.put(API_URL + 'profile', profileData, config);
};

const guidesService = {
  getGuides,
  getMyProfile,
  updateProfile
};

export default guidesService;
