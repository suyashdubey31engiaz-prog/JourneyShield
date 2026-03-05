import express from 'express';
import axios from 'axios';

const router = express.Router();

// 1. Existing Places Search (OpenStreetMap)
router.get('/places', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'JourneyShield-App/1.0' } 
    });

    const formattedResults = data.map(place => ({
      fsq_id: place.place_id ? place.place_id.toString() : Math.random().toString(),
      name: place.name || (place.display_name ? place.display_name.split(',')[0] : 'Unknown Location'),
      location: {
        formatted_address: place.display_name || 'Address unavailable'
      },
      geocodes: {
        main: {
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon)
        }
      }
    }));

    res.status(200).json({ results: formattedResults });

  } catch (error) {
    console.error("OSM Search Backend Error:", error.message);
    res.status(500).json({ message: 'Failed to fetch places' });
  }
});

// 2. DIAGNOSTIC MODE: Enterprise-Grade Routing (TomTom)
router.get('/route', async (req, res) => {
  try {
    const { startLat, startLon, endLat, endLon } = req.query;
    const tomtomKey = process.env.TOMTOM_API_KEY;

    if (!tomtomKey) return res.status(500).json({ message: "TomTom API key missing" });

    const url = `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLon}:${endLat},${endLon}/json?key=${tomtomKey}`;
    
    console.log(`[DEBUG] Asking TomTom for route from ${startLat},${startLon} to ${endLat},${endLon}...`);
    
    const { data } = await axios.get(url);
    const points = data.routes[0].legs[0].points.map(p => [p.latitude, p.longitude]);
    
    console.log(`[DEBUG] TomTom successfully returned ${points.length} route coordinates!`);
    res.status(200).json(points);

  } catch (error) {
    // THIS CATCHES EXACTLY WHY THE BLUE LINE IS FAILING
    console.error("[CRITICAL] TomTom Routing Error:", error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to calculate route' });
  }
});

export default router;