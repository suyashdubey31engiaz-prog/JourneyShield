import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users/';

// Register user
const register = (userData) => {
  return axios.post(API_URL + 'register', userData);
};

// Login user
const login = (userData) => {
  return axios.post(API_URL + 'login', userData);
};

const authService = {
  register,
  login,
};

export default authService;