import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/reviews/';


const getAuth = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${user?.token}` } };
};

const createReview = (reviewData) => {
  return axios.post(API_URL, reviewData, getAuth());
};

const getReviews = (guideId) => {
  return axios.get(API_URL + guideId);
};

export default { createReview, getReviews };