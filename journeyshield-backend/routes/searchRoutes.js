import express from 'express';
import { geocodeLocation, searchNearbyPlaces, getRoute } from '../controllers/searchController.js';

const router = express.Router();

// Geocode a place name → { lat, lon, displayName, city, boundingBox }
router.get('/geocode', geocodeLocation);

// Nearby POI search → { results[], total }
// params: lat, lon, radius (metres), query (optional keyword), category (optional)
router.get('/places', searchNearbyPlaces);

// Route between two coordinates → [[lat,lon], ...]
router.get('/route', getRoute);

export default router;