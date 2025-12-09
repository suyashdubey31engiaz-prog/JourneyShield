import express from 'express';
import { createOrUpdateReview, getGuideReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrUpdateReview); // Uses the new logic

router.route('/:guideId')
  .get(getGuideReviews);

export default router;