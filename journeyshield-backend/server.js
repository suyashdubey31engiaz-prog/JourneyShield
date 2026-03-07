import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes         from './routes/userRoutes.js';
import tourRoutes         from './routes/tourRoutes.js';
import searchRoutes       from './routes/searchRoutes.js';
import weatherRoutes      from './routes/weatherRoutes.js';
import bookingRoutes      from './routes/bookingRoutes.js';
import safetyReportRoutes from './routes/safetyReportRoutes.js';
import reviewRoutes       from './routes/reviewRoutes.js';   // FIX: was never imported
import guideRoutes        from './routes/guideRoutes.js';    // FIX: was never imported
import placesRoutes       from './routes/placesRoutes.js';
import geocodeRoutes      from './routes/geocodeRoutes.js';
import incidentRoutes     from './routes/incidentRoutes.js';
import alertRoutes        from './routes/alertRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/users',     userRoutes);
app.use('/api/tours',     tourRoutes);
app.use('/api/search',    searchRoutes);
app.use('/api/weather',   weatherRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/safety',    safetyReportRoutes);
app.use('/api/reviews',   reviewRoutes);   // FIX: this was missing — caused "Failed to submit review"
app.use('/api/guides',    guideRoutes);    // FIX: this was missing — caused guide profile 404s
app.use('/api/places',    placesRoutes);
app.use('/api/geocode',   geocodeRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts',    alertRoutes);

app.get('/', (req, res) => res.send('JourneyShield API is running...'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));