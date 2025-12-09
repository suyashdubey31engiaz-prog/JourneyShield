import express from 'express';
import { createBooking, getMyBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking);

router.route('/my-bookings')
  .get(protect, getMyBookings);

router.route('/:id')
  .put(protect, updateBookingStatus);

export default router;