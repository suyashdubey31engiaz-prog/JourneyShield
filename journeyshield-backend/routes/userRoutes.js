import express from 'express';
import {
  sendRegistrationOTP,
  verifyAndRegister,
  loginUser,
  getGuides,
  getMyProfile,
  updateMyProfile,
  getPublicGuideProfile,
  getPublicTravelerProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth
router.post('/send-otp',        sendRegistrationOTP);
router.post('/verify-register', verifyAndRegister);
router.post('/login',           loginUser);

// Own profile (traveler)
router.get('/me',  protect, getMyProfile);
router.put('/me',  protect, updateMyProfile);

// Guide list (used by Guides.jsx)
router.get('/guides', getGuides);

// Public profiles
router.get('/guide/:userId',    protect, getPublicGuideProfile);     // traveler views guide
router.get('/traveler/:userId', protect, getPublicTravelerProfile);  // guide views limited traveler

export default router;