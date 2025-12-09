import axios from 'axios';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/incidents';

const getNearbyIncidents = (lat, lon, radius = 5) => {
  return axios.get(API_URL, {
    params: { lat, lon, radius }
  });
};

const reportIncident = (incidentData) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || !user.token) return Promise.reject("Not authorized");

  return axios.post(API_URL, incidentData, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
};

const incidentService = {
  getNearbyIncidents,
  reportIncident
};

export default incidentService;