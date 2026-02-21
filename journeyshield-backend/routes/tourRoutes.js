import express from 'express';
import { 
  createTour, 
  getAvailableTours, 
  joinTour, 
  kickTraveler, 
  cancelTour 
} from '../controllers/tourController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Get all open tours OR Create a new tour
router.route('/')
  .get(getAvailableTours)
  .post(protect, createTour); 

// Delete/Cancel an entire tour
router.route('/:id')
  .delete(protect, cancelTour);

// Join a tour as a traveler
router.route('/:id/join')
  .post(protect, joinTour);

// Kick a specific traveler from a tour
router.route('/:id/kick')
  .post(protect, kickTraveler);

export default router;