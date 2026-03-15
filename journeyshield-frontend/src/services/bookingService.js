import axios from 'axios';

const API_URL     = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/bookings';
const PAYMENT_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/payments';

const cfg = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ── Bookings ──────────────────────────────────────────────────────────────────
export const createBooking = async (bookingData, token) => {
  const res = await axios.post(API_URL, bookingData, cfg(token));
  return res.data;
};

export const getMyBookings = async (token) => {
  const res = await axios.get(`${API_URL}/mybookings`, cfg(token));
  return res.data;
};

export const getGuideBookings = async (token) => {
  const res = await axios.get(`${API_URL}/guidebookings`, cfg(token));
  return res.data;
};

export const updateBookingStatus = async (bookingId, status, token) => {
  const res = await axios.put(`${API_URL}/${bookingId}/status`, { status }, cfg(token));
  return res.data;
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const initiatePayment = async (bookingId, method, token) => {
  const res = await axios.post(`${PAYMENT_URL}/initiate`, { bookingId, method }, cfg(token));
  return res.data;
};

export const travelerConfirmPayment = async (bookingId, token) => {
  const res = await axios.put(`${PAYMENT_URL}/${bookingId}/traveler-confirm`, {}, cfg(token));
  return res.data;
};

export const guideConfirmPayment = async (bookingId, token) => {
  const res = await axios.put(`${PAYMENT_URL}/${bookingId}/guide-confirm`, {}, cfg(token));
  return res.data;
};

export const getPayment = async (bookingId, token) => {
  const res = await axios.get(`${PAYMENT_URL}/${bookingId}`, cfg(token));
  return res.data;
};