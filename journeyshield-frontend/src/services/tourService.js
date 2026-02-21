import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tours/'; // Ensure this matches your backend port

export const getTours = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createTour = async (tourData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL, tourData, config);
  return response.data;
};

export const joinTour = async (tourId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(`${API_URL}${tourId}/join`, {}, config);
  return response.data;
};

export const kickTraveler = async (tourId, travelerId, reason, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(
    `${API_URL}${tourId}/kick`, 
    { travelerId, reason }, 
    config
  );
  return response.data;
};

export const cancelTour = async (tourId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.delete(`${API_URL}${tourId}`, config);
  return response.data;
};