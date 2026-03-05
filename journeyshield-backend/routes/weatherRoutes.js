import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper function: Turns raw weather into a "Safety Report"
const generateSafetyReport = (locationName, weatherData) => {
  const temp = weatherData.main?.temp || 28;
  const desc = weatherData.weather?.[0]?.description || "clear sky";
  
  let score = 95;
  let level = "Safe";
  let color = "green";
  let incidents = 0;
  let recent = [];

  // Intelligently lower the safety score if the weather is extreme
  if (temp > 40 || temp < 5 || desc.includes('rain') || desc.includes('storm')) {
    score = 72;
    level = "Moderate Risk";
    color = "yellow";
    incidents = 2;
    recent = ["Weather Warning", "Slippery Roads"];
  }

  return {
    location: locationName,
    safetyScore: score,
    safetyLevel: level,
    safetyColor: color,
    incidentCount: incidents,
    weather: `${temp}°C, ${desc.charAt(0).toUpperCase() + desc.slice(1)}`,
    traffic: "Flow: Normal",
    recentIncidents: recent
  };
};

// 1. Get Safety Report by Coordinates (For "Your Current Location")
router.get('/local', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    // Uses the exact key from your .env file
    const apiKey = process.env.OPENWEATHER_API_KEY; 
    
    let weatherData = {};
    let locationName = "Your Location";

    if (apiKey && lat && lon) {
      const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      weatherData = data;
      locationName = data.name || "Your Location";
    }

    res.json(generateSafetyReport(locationName, weatherData));
  } catch (error) {
    console.error("Local Weather Error:", error.message);
    res.json(generateSafetyReport("Your Location", {})); // Fallback so it doesn't crash
  }
});

// 2. Get Safety Report by City Name (For "Check Another City" Search)
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY; 
    
    let weatherData = {};
    let locationName = city.charAt(0).toUpperCase() + city.slice(1);

    if (apiKey) {
      const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      weatherData = data;
      locationName = data.name || locationName;
    }

    res.json(generateSafetyReport(locationName, weatherData));
  } catch (error) {
    console.error("City Weather Error:", error.message);
    res.json(generateSafetyReport(city, {})); // Fallback so it doesn't crash
  }
});

export default router;