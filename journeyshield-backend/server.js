import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import safetyReportRoutes from './routes/safetyReportRoutes.js';
import routeRoutes from './routes/routeRoutes.js'; // 1. Import new route
import incidentRoutes from './routes/incidentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());

// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/safety-report', safetyReportRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));