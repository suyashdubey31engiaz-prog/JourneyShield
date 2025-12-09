import express from 'express';
import { getSafetyReportByCity, getSafetyReportByCoords } from '../controllers/safetyReportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getSafetyReportByCity); // For city search
router.route('/current').get(protect, getSafetyReportByCoords); // For current location

export default router;