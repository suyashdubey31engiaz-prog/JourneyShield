import axios from 'axios';
import Incident from '../models/incidentModel.js';

// Helper to calculate safety score
const calculateSafetyScore = (incidents) => {
    let score = 100;
    
    incidents.forEach(incident => {
        if (incident.severity === 'Critical') score -= 20;
        else if (incident.severity === 'High') score -= 10;
        else if (incident.severity === 'Medium') score -= 5;
        else score -= 2; // Low severity
    });

    // Ensure score doesn't drop below 0
    return Math.max(0, score);
};

const getSafetyLevel = (score) => {
    if (score >= 80) return { level: 'Safe', color: 'green' };
    if (score >= 50) return { level: 'Caution', color: 'yellow' };
    return { level: 'Danger', color: 'red' };
};

const fetchCombinedReport = async (lat, lon, locationName) => {
    const openWeatherKey = process.env.OPENWEATHER_API_KEY;
    const tomTomKey = process.env.TOMTOM_API_KEY;

    // 1. Fetch External Data (Weather & Traffic)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`;
    const trafficUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomTomKey}`;

    const [weatherRes, trafficRes] = await Promise.allSettled([
        axios.get(weatherUrl),
        axios.get(trafficUrl)
    ]);

    // 2. Fetch Internal Data (Your Incident Database)
    // Find incidents within 10km radius
    const incidents = await Incident.find({
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: [lon, lat] }, // GeoJSON: [Lon, Lat]
                $maxDistance: 10000 // 10km
            }
        }
    });

    // 3. Calculate Score
    const safetyScore = calculateSafetyScore(incidents);
    const safetyStatus = getSafetyLevel(safetyScore);

    return {
        location: locationName,
        weather: weatherRes.status === 'fulfilled' ? 
            `${weatherRes.value.data.main.temp}°C, ${weatherRes.value.data.weather[0].description}` : 'Unavailable',
        traffic: trafficRes.status === 'fulfilled' ? 
            `Flow: ${trafficRes.value.data.flowSegmentData.currentSpeed} km/h` : 'Unavailable',
        
        // NEW SAFETY DATA
        safetyScore: safetyScore,
        safetyLevel: safetyStatus.level,
        safetyColor: safetyStatus.color,
        incidentCount: incidents.length,
        recentIncidents: incidents.slice(0, 3).map(i => i.type) // Show top 3 recent types
    };
};

const getSafetyReportByCity = async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: 'City parameter is required' });

    try {
        const openWeatherKey = process.env.OPENWEATHER_API_KEY;
        const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${openWeatherKey}`;
        
        const geocodeResponse = await axios.get(geocodeUrl);
        if (geocodeResponse.data.length === 0) {
            throw new Error(`Geocoding failed: City '${city}' not found.`);
        }
        
        const { lat, lon, name } = geocodeResponse.data[0];
        const report = await fetchCombinedReport(lat, lon, name);
        res.json(report);
    } catch (error) {
        console.error("Safety Report Error:", error.message);
        res.status(500).json({ message: 'Failed to generate safety report.' });
    }
};

const getSafetyReportByCoords = async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Lat/Lon parameters are required' });

    try {
        const openWeatherKey = process.env.OPENWEATHER_API_KEY;
        // Simple reverse geocode to get name (optional, can skip if unavailable)
        let locationName = "Current Location";
        try {
             const reverseGeocodeUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${openWeatherKey}`;
             const reverseRes = await axios.get(reverseGeocodeUrl);
             if(reverseRes.data.length > 0) locationName = reverseRes.data[0].name;
        } catch(e) { console.log("Reverse geocode failed, using default name"); }

        const report = await fetchCombinedReport(parseFloat(lat), parseFloat(lon), locationName);
        res.json(report);
    } catch (error) {
        console.error("Safety Report Error:", error.message);
        res.status(500).json({ message: 'Failed to generate safety report.' });
    }
};

export { getSafetyReportByCity, getSafetyReportByCoords };