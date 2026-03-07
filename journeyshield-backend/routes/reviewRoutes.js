import express from 'express';
import {
  createOrUpdateReview,
  getGuideReviews,
  getMyReviewForGuide,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',                          protect, createOrUpdateReview);
router.get('/:guideId',                            getGuideReviews);
router.get('/:guideId/my',               protect, getMyReviewForGuide);

export default router;