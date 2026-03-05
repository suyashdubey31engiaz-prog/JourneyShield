import axios from 'axios';

// Pointing to your REAL safety API
const API_URL = 'http://localhost:5000/api/safety';

const getSafetyReport = async (city, lat, lon) => {
  // Grab the token so the backend allows the request
  const user = JSON.parse(sessionStorage.getItem('user'));
  const config = {
    headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {}
  };

  // If the user typed a city in the search bar
  if (city) {
    return await axios.get(`${API_URL}?city=${city}`, config);
  } 
  // If it's automatically loading their GPS location
  else if (lat && lon) {
    return await axios.get(`${API_URL}/current?lat=${lat}&lon=${lon}`, config);
  }
  
  throw new Error("No location provided");
};

export default { getSafetyReport };