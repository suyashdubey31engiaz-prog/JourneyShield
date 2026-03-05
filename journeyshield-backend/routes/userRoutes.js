import express from 'express';
// Import the new functions
import { sendRegistrationOTP, verifyAndRegister, loginUser, getGuides } from '../controllers/userController.js'; 

const router = express.Router();

// The new two-step routes
router.post('/send-otp', sendRegistrationOTP);
router.post('/verify-register', verifyAndRegister);

// Your existing routes
router.post('/login', loginUser);
router.get('/guides', getGuides);

export default router;