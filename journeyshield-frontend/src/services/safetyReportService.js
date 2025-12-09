import axios from 'axios';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/safety-report';

const getSafetyReport = (city, lat, lon) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
    params: {}
  };

  if (city) {
    config.params.city = city;
    return axios.get(API_URL, config);
  } else if (lat && lon) {
    config.params.lat = lat;
    config.params.lon = lon;
    return axios.get(`${API_URL}/current`, config);
  }
};

const safetyReportService = {
  getSafetyReport,
};

export default safetyReportService;