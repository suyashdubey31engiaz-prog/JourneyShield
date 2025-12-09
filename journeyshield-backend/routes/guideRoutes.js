import express from 'express';
import { getGuides, getMyGuideProfile, updateGuideProfile } from '../controllers/guideController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getGuides);
router.route('/me').get(protect, getMyGuideProfile);     // Get my profile
router.route('/profile').put(protect, updateGuideProfile); // Update my profile

export default router;