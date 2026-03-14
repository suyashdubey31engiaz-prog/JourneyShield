import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/bookings';

// --- 1. Create a new booking (Traveler hiring a Guide) ---
export const createBooking = async (bookingData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL, bookingData, config);
  return response.data;
};

// --- 2. Get all bookings made by the logged-in Traveler ---
export const getMyBookings = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/mybookings`, config);
  return response.data;
};

// --- 3. Get all booking requests received by the logged-in Guide ---
export const getGuideBookings = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/guidebookings`, config);
  return response.data;
};

// --- 4. Update booking status (Guide accepting or rejecting) ---
export const updateBookingStatus = async (bookingId, status, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${bookingId}/status`, { status }, config);
  return response.data;
};