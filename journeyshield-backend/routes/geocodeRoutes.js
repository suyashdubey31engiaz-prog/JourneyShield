import express from 'express';
import { getCoordinatesForCity } from '../controllers/geocodeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getCoordinatesForCity);

export default router;