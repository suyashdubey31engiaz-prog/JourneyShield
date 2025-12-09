import express from 'express';
import { getRoute } from '../controllers/routeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getRoute);

export default router;