import express from 'express';
import {
  sendRegistrationOTP, verifyAndRegister,
  loginUser, getGuides,
  getTravelerProfile, updateTravelerProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp',        sendRegistrationOTP);
router.post('/verify-register', verifyAndRegister);
router.post('/login',           loginUser);
router.get('/guides',           getGuides);
router.get('/profile',  protect, getTravelerProfile);
router.put('/profile',  protect, updateTravelerProfile);

export default router;