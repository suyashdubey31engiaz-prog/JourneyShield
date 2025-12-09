import axios from 'axios';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/bookings/';

// Helper to get auth header
const getAuthConfig = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || !user.token) return null;
  return { headers: { Authorization: `Bearer ${user.token}` } };
};

const createBooking = (bookingData) => {
  const config = getAuthConfig();
  if (!config) return Promise.reject("Not authorized");
  return axios.post(API_URL, bookingData, config);
};

const getMyBookings = () => {
  const config = getAuthConfig();
  if (!config) return Promise.reject("Not authorized");
  return axios.get(API_URL + 'my-bookings', config);
};

const updateStatus = (id, status) => {
  const config = getAuthConfig();
  if (!config) return Promise.reject("Not authorized");
  return axios.put(API_URL + id, { status }, config);
};

const bookingService = {
  createBooking,
  getMyBookings,
  updateStatus
};

export default bookingService;