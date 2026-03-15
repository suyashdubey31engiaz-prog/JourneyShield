import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  initiatePayment,
  travelerConfirm,
  guideConfirm,
  getPayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/initiate',                       protect, initiatePayment);
router.put('/:bookingId/traveler-confirm',     protect, travelerConfirm);
router.put('/:bookingId/guide-confirm',        protect, guideConfirm);
router.get('/:bookingId',                      protect, getPayment);

export default router;