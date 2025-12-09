import axios from 'axios';

const getCoordinatesForCity = async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.length === 0) {
      return res.status(404).json({ message: 'City not found' });
    }
    const { lat, lon } = response.data[0];
    res.json({ latitude: lat, longitude: lon });
  } catch (error) {
    // We are adding a detailed console.log here to see the real error
    console.error("OpenWeatherMap Geocoding Error:", error.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching geocoding data' });
  }
};

export { getCoordinatesForCity };