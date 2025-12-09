import axios from 'axios';

const getPlaces = async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'API Key not configured on server' });
  }

  // Increased radius from 5000m to 20000m (20km) to find more results
  const url = `https://api.foursquare.com/v3/places/search?ll=${lat}%2C${lon}&radius=20000&limit=20&sort=POPULARITY`;

  const options = {
    method: 'GET',
    url: url,
    headers: {
      accept: 'application/json',
      Authorization: apiKey,
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data.results);
  } catch (error) {
    console.error("Foursquare API Error:", error.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching places from Foursquare. Please check your API key.' });
  }
};

export { getPlaces };