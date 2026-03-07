import express from 'express';
import {
  getSafetyReportByCity,
  getSafetyReportByCoords,
  getIncidents
} from '../controllers/safetyReportController.js';

const router = express.Router();

router.get('/',         getSafetyReportByCity);    // ?city=Mumbai
router.get('/current',  getSafetyReportByCoords);  // ?lat=&lon=
router.get('/incidents', getIncidents);

export default router;