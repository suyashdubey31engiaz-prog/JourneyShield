import express from 'express';
import { searchPlaces } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, searchPlaces);

export default router;