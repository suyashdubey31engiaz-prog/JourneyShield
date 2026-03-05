import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import safetyReportRoutes from './routes/safetyReportRoutes.js'; // <--- 1. Import Safety Routes

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/weather', weatherRoutes); 
app.use('/api/bookings', bookingRoutes); 
app.use('/api/safety', safetyReportRoutes); // <--- 2. Activate the real Safety API!

app.get('/', (req, res) => {
  res.send('JourneyShield API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});