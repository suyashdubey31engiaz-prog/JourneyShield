
import express from 'express';
import { getPlaces } from '../controllers/placesController.js';
import { protect } from '../middleware/authMiddleware.js'; // 1. Import the middleware

const router = express.Router();

// 2. Add the 'protect' middleware to this route
router.route('/').get(protect, getPlaces);

export default router;