import axios from 'axios';

const getWeatherAlert = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'A city is required.' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const { weather, main, name } = response.data;
    
    // Format the data into a simple alert
    const alertData = {
      location: name,
      description: `Current weather: ${weather[0].description}.`,
      temperature: `${main.temp}°C`,
      feels_like: `${main.feels_like}°C`,
    };
    res.json(alertData);
  } catch (error) {
    console.error("OpenWeatherMap API Error:", error.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching weather data. Please check the city name.' });
  }
};

export { getWeatherAlert };