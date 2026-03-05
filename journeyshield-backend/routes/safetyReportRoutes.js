import express from 'express';
import { 
    getSafetyReportByCity, 
    getSafetyReportByCoords, 
    getIncidents 
} from '../controllers/safetyReportController.js';

const router = express.Router();

// 1. Get Safety Report by City Name
router.get('/', getSafetyReportByCity);

// 2. Get Safety Report by GPS Coordinates
router.get('/current', getSafetyReportByCoords);

// 3. NEW: Get nearby incidents for the Discover Map markers
router.get('/incidents', getIncidents);

export default router;