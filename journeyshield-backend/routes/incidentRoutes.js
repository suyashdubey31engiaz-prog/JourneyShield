import express from 'express';
import { reportIncident, getNearbyIncidents } from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNearbyIncidents)
  .post(protect, reportIncident); // Requires login to report

export default router;