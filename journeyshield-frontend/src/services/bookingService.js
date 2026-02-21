import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bookings/'; // Ensure this matches your backend port

// 1. Create a new private booking (or group booking)
export const createBooking = async (bookingData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  // bookingData contains: guideId, date, isPrivateGroup, groupMembers
  const response = await axios.post(API_URL, bookingData, config);
  return response.data;
};

// 2. Fetch all bookings made by the traveler
export const getMyBookings = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}mybookings`, config);
  return response.data;
};

// 3. Fetch all requests sent to the guide
export const getGuideBookings = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}guidebookings`, config);
  return response.data;
};

// 4. Update the status of a booking (Guide accepts/rejects)
export const updateBookingStatus = async (bookingId, status, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}${bookingId}/status`, { status }, config);
  return response.data;
};