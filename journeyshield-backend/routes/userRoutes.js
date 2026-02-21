import express from 'express';
import { registerUser, loginUser, getGuides } from '../controllers/userController.js'; 

// Uncomment this if you have the protect middleware for user routes
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. SPECIFIC ROUTES MUST GO FIRST
// This fixes the 404 error by preventing Express from treating 'guides' as a dynamic ID
router.get('/guides', getGuides);

// 2. STANDARD AUTH ROUTES
router.post('/register', registerUser);
router.post('/login', loginUser);

// 3. DYNAMIC ROUTES GO LAST
// If you ever add a route to get a specific user by ID, it must go down here!
// Example: router.get('/:id', getUserById);

export default router;