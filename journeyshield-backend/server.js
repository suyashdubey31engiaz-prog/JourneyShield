import 'dotenv/config';
import express        from 'express';
import cors           from 'cors';
import { createServer } from 'http';
import { Server }     from 'socket.io';
import jwt            from 'jsonwebtoken';
import connectDB      from './config/db.js';

// Routes
import userRoutes         from './routes/userRoutes.js';
import tourRoutes         from './routes/tourRoutes.js';
import searchRoutes       from './routes/searchRoutes.js';
import weatherRoutes      from './routes/weatherRoutes.js';
import bookingRoutes      from './routes/bookingRoutes.js';
import safetyReportRoutes from './routes/safetyReportRoutes.js';
import reviewRoutes       from './routes/reviewRoutes.js';
import guideRoutes        from './routes/guideRoutes.js';
import placesRoutes       from './routes/placesRoutes.js';
import geocodeRoutes      from './routes/geocodeRoutes.js';
import incidentRoutes     from './routes/incidentRoutes.js';
import alertRoutes        from './routes/alertRoutes.js';
import chatRoutes         from './routes/chatRoutes.js';

// Socket handlers
import { registerSocketHandlers } from './socket/socketHandlers.js';

const app    = express();
const httpServer = createServer(app);   // ← wrap express in http server for Socket.io
const PORT   = process.env.PORT || 5000;

connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ── REST Routes ───────────────────────────────────────────────────────────────
app.use('/api/users',    userRoutes);
app.use('/api/tours',    tourRoutes);
app.use('/api/search',   searchRoutes);
app.use('/api/weather',  weatherRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/safety',   safetyReportRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/guides',   guideRoutes);
app.use('/api/places',   placesRoutes);
app.use('/api/geocode',  geocodeRoutes);
app.use('/api/incidents',incidentRoutes);
app.use('/api/alerts',   alertRoutes);
app.use('/api/chat',     chatRoutes);

app.get('/', (req, res) => res.send('JourneyShield API is running...'));

// ── Socket.io setup ───────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Auth middleware for Socket.io — verify JWT on every connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key');
    socket.userId = String(decoded.id);
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Each user joins a room named after their own userId
  // This lets us send targeted events with io.to(userId).emit(...)
  socket.join(socket.userId);
  console.log(`🔌 Socket connected: ${socket.userId}`);

  registerSocketHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.userId}`);
  });
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));