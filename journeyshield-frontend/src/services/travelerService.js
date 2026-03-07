import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users';

const getAuth = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${user?.token}` } };
};

const getMyProfile   = ()       => axios.get(`${BASE}/profile`, getAuth());
const updateProfile  = (data)   => axios.put(`${BASE}/profile`, data, getAuth());

export default { getMyProfile, updateProfile };