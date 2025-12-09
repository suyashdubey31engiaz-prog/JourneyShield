import express from 'express';
import { getWeatherAlert } from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected, so only logged-in users can access it
router.route('/').get(protect, getWeatherAlert);

export default router;