import axios from 'axios';
import Incident from '../models/incidentModel.js';

// --- Helper Functions ---
const calculateSafetyScore = (incidents) => {
    let score = 100;
    incidents.forEach(incident => {
        if (incident.severity === 'Critical') score -= 20;
        else if (incident.severity === 'High') score -= 10;
        else if (incident.severity === 'Medium') score -= 5;
        else score -= 2; 
    });
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

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`;
    const trafficUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${tomTomKey}`;

    const [weatherRes, trafficRes] = await Promise.allSettled([
        axios.get(weatherUrl),
        axios.get(trafficUrl)
    ]);

    // This still uses the 10km radius strictly for the Safety Analytics Score calculation
    const incidents = await Incident.find({
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: [lon, lat] }, 
                $maxDistance: 10000 
            }
        }
    });

    const safetyScore = calculateSafetyScore(incidents);
    const safetyStatus = getSafetyLevel(safetyScore);

    return {
        location: locationName,
        weather: weatherRes.status === 'fulfilled' ? 
            `${weatherRes.value.data.main.temp}°C, ${weatherRes.value.data.weather[0].description}` : 'Unavailable',
        traffic: trafficRes.status === 'fulfilled' ? 
            `Flow: ${trafficRes.value.data.flowSegmentData.currentSpeed} km/h` : 'Unavailable',
        safetyScore: safetyScore,
        safetyLevel: safetyStatus.level,
        safetyColor: safetyStatus.color,
        incidentCount: incidents.length,
        recentIncidents: incidents.slice(0, 3).map(i => i.type) 
    };
};

// --- Controllers ---

// 1. Generate Report by City Name
const getSafetyReportByCity = async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: 'City parameter is required' });

    try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        const geocodeResponse = await axios.get(geocodeUrl, { headers: { 'User-Agent': 'JourneyShield-Travel-App/1.0' } });
        
        if (geocodeResponse.data.length === 0) {
            throw new Error(`City '${city}' not found.`);
        }
        
        const lat = parseFloat(geocodeResponse.data[0].lat);
        const lon = parseFloat(geocodeResponse.data[0].lon);
        const name = geocodeResponse.data[0].name || city;

        const report = await fetchCombinedReport(lat, lon, name);
        res.json(report);
    } catch (error) {
        console.error("Safety Report City Error:", error.message);
        res.status(500).json({ message: 'Failed to generate safety report.' });
    }
};

// 2. Generate Report by Coordinates
const getSafetyReportByCoords = async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'Lat/Lon parameters are required' });

    try {
        let locationName = "Current Location";
        
        try {
             const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
             const reverseRes = await axios.get(reverseUrl, { headers: { 'User-Agent': 'JourneyShield-Travel-App/1.0' } });
             
             if(reverseRes.data && reverseRes.data.address) {
                 const addr = reverseRes.data.address;
                 locationName = addr.city || addr.state_district || addr.town || addr.county || addr.state || "Current Location";
             }
        } catch(e) { 
             console.error("Reverse geocode failed:", e.message);
        }

        const report = await fetchCombinedReport(parseFloat(lat), parseFloat(lon), locationName);
        res.json(report);
    } catch (error) {
        console.error("Safety Report Coords Error:", error.message);
        res.status(500).json({ message: 'Failed to generate safety report.' });
    }
};

// 3. NEW DIAGNOSTIC MODE: Fetch ALL Incidents for the Map markers
const getIncidents = async (req, res) => {
    try {
        // TEMPORARY BYPASS: Grabbing all incidents instead of just nearby ones
        const incidents = await Incident.find({});
        
        // This log will prove if the seeder actually saved data to the database
        console.log(`[DEBUG] Successfully fetched ${incidents.length} incidents from MongoDB!`);
        
        res.status(200).json(incidents);
    } catch (error) {
        console.error("Incident Fetch Error:", error.message);
        res.status(500).json({ message: 'Failed to fetch nearby incidents' });
    }
};

export { getSafetyReportByCity, getSafetyReportByCoords, getIncidents };