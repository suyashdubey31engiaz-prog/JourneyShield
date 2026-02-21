import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getGuideBookings, 
  updateBookingStatus 
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes MUST come before /:id routes
router.get('/mybookings', protect, getMyBookings);
router.get('/guidebookings', protect, getGuideBookings);

// Standard / Dynamic routes
router.post('/', protect, createBooking);
router.put('/:id/status', protect, updateBookingStatus);

export default router;