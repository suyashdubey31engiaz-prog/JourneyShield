import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/reviews';

const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return u?.token ? { headers: { Authorization: `Bearer ${u.token}` } } : {};
};

// Submit or update a review (tied to a specific booking)
const createReview  = (data)     => axios.post(`${BASE}/`,               data, auth());

// All public reviews for a guide
const getReviews    = (guideId)  => axios.get(`${BASE}/${guideId}`);

// Traveler's own review for a guide (pre-fill edit modal)
const getMyReview   = (guideId)  => axios.get(`${BASE}/${guideId}/my`,   auth());

export default { createReview, getReviews, getMyReview };