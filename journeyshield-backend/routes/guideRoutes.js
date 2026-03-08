import express from 'express';
import { getGuides, getMyGuideProfile, updateGuideProfile } from '../controllers/guideController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',        protect, getGuides);
router.get('/me',      protect, getMyGuideProfile);
router.put('/profile', protect, updateGuideProfile);

export default router;