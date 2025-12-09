import axios from 'axios';

const getRoute = async (req, res) => {
  const { startLat, startLon, endLat, endLon } = req.query;

  if (!startLat || !startLon || !endLat || !endLon) {
    return res.status(400).json({ message: 'Start and end coordinates are required' });
  }

  const apiKey = process.env.TOMTOM_API_KEY;
  const url = `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLon}:${endLat},${endLon}/json?key=${apiKey}&travelMode=car`;

  try {
    const response = await axios.get(url);
    // The route coordinates are in the 'points' array of the first leg of the first route
    const points = response.data.routes[0].legs[0].points.map(p => [p.latitude, p.longitude]);
    res.json(points);
  } catch (error) {
    console.error("TomTom Routing API Error:", error.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching route data from TomTom' });
  }
};

export { getRoute };