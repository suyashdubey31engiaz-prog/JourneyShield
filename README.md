<div align="center">

# 🛡️ JourneyShield

### A Full-Stack Travel Safety Platform

*Connecting Travelers with Verified Local Guides across India*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-journey--shield.vercel.app-yellow?style=for-the-badge&logo=vercel)](https://journey-shield.vercel.app)
[![Backend](https://img.shields.io/badge/API-journeyshield--api.onrender.com-green?style=for-the-badge&logo=render)](https://journeyshield-api.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/suyashdubey31engiaz-prog/JourneyShield)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socketdotio)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Live URLs](#live-urls)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Real-Time Architecture](#real-time-architecture)
- [Payment System](#payment-system)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Challenges Faced & Solutions](#challenges-faced--solutions)
- [What to Avoid](#what-to-avoid)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## 📖 About The Project

JourneyShield is a travel safety platform built to bridge the gap between travelers exploring unfamiliar cities and local guides who know those cities deeply. Travelers can discover safe places on an interactive map, hire verified guides, communicate in real-time, manage bookings and payments, report safety incidents, and check weather and safety alerts — all in one application.

The platform supports three user roles: **Traveler**, **Guide**, and **Both** — allowing a single account to operate in either capacity depending on login selection.

**Built as a portfolio project demonstrating:**
- Full-stack application architecture
- Real-time communication with Socket.io
- Cloud deployment with CI/CD via GitHub
- Integration of 10+ external APIs and services
- Complete payment lifecycle design

---

## 🔗 Live URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://journey-shield.vercel.app |
| Backend API (Render) | https://journeyshield-api.onrender.com |
| GitHub Repository | https://github.com/suyashdubey31engiaz-prog/JourneyShield |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI component framework |
| Vite | 5.4 | Build tool and dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Socket.io Client | 4.8 | Real-time communication |
| Axios | 1.7 | HTTP requests |
| React Router | v6 | Client-side routing |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 | JavaScript runtime |
| Express | 4.19 | REST API framework |
| MongoDB Atlas | Cloud | NoSQL database |
| Mongoose | 8.4 | MongoDB ODM |
| Socket.io | 4.8 | Real-time bidirectional events |
| JWT (jsonwebtoken) | 9 | Stateless authentication |
| bcryptjs | 2.4 | Password hashing |
| Axios | 1.7 | HTTP calls to external APIs |

### External Services
| Service | Purpose | Why Chosen |
|---------|---------|------------|
| **Vercel** | Frontend hosting | Auto-deploy from GitHub, free SSL, global CDN |
| **Render** | Backend hosting | Free Node.js hosting with auto-deploy |
| **MongoDB Atlas** | Cloud database | Free 512MB, managed backups |
| **Cloudinary** | Media storage | Stores images/audio/files — keeps MongoDB lean |
| **Brevo** | Email OTP delivery | HTTP API — unblocked on Render (SMTP ports blocked) |
| **TomTom API** | Maps & POI search | Rich location data for Discover feature |
| **Nominatim** | Reverse geocoding | Free — GPS coordinates to readable addresses |
| **OpenWeather API** | Weather data | Real-time weather for safety context |
| **Ticketmaster API** | Events discovery | Local events for travel planning |
| **UptimeRobot** | Uptime monitoring | External ping every 5 min — alerts on downtime |

---

## ✨ Features

### 🔐 Authentication
- OTP-based email verification on registration (6-digit code via Brevo)
- JWT login with 30-day token expiry
- bcrypt password hashing (salt rounds: 10)
- Role-based access control — Traveler / Guide / Both
- Session stored in `sessionStorage` (cleared on browser close)
- Auto-wake server ping on Login and Register pages

### 👤 User Profiles
- Separate profiles for Traveler and Guide roles
- Cloudinary avatar upload with crop-to-circle tool
- Mandatory field validation with red highlighting on empty submit
- Submit protection — disabled button while saving, prevents double-click
- Toast notification on save (slide-in, 10s auto-dismiss, X to close)
- Emergency contact storage (private, never shown to others)

### 🗺️ Guide Discovery & Booking
- Browse all guides with ratings, price/hour, languages, specialties
- Filter and search guides by location
- Full guide profile drawer with reviews and social links
- Book private or group tours with specific date
- Add group members with name, age, and special notes
- Booking lifecycle: **Pending → Accepted → Payment Initiated → Completed → Reviewed**

### 💬 Real-Time Chat (Socket.io)
- Chat access requires traveler to request → guide to approve
- Text messaging with instant delivery
- 📸 Image sharing (Cloudinary upload → thumbnail bubble)
- 🎵 Audio messages (hold-to-record → Cloudinary → audio player)
- 📄 File sharing (any file type → download card)
- 📍 Location sharing (GPS → Nominatim → map thumbnail)
- 😊 Emoji reactions on any message (toggle, real-time sync)
- ✓✓ Read receipts
- Typing indicators ("User is typing...")
- Messages auto-delete after **60 days** (MongoDB TTL index)
- Unread badge count in navbar (polls `/api/chat/unread-count`)

### 💳 Payment System
- Cash (offline) mode — fully functional end-to-end
- Online (UPI/Cards) — UI built, disabled with "Coming Soon" banner
- Transparent receipt: booking amount, method, guide receives
- Dual confirmation: Traveler confirms sent → Guide confirms received
- Step-by-step timeline tracker: Accepted → Initiated → Traveler Confirmed → Guide Confirmed → Completed
- Booking auto-marked Complete on guide confirmation
- Payment records auto-delete after **6 months** (MongoDB TTL index)
- Future Razorpay integration: 5% platform fee + 18% GST on fee — formula reserved, not yet active

### 🛡️ Safety Features
- Safety score per city based on incident report aggregation
- Weather integration via OpenWeather API
- Safety tips and recommendations
- Emergency contact storage (private)
- City-based incident reporting

### 🎪 Group Tours
- Guides create public group tours with title, description, date, price, max capacity
- Travelers browse and join open tours
- Auto-status: Open → Full (when capacity reached) → Completed/Cancelled
- Guide can kick specific participants or cancel entire tour

### ⭐ Review System
- Leave review only after booking is Completed
- 1-5 star rating with written comment
- Edit review (tracked with edit count)
- Star distribution displayed on guide profiles
- One review per booking enforced

### 🔔 Toast Notifications
- Slide-in from right side of screen
- Progress bar countdown (10 seconds)
- Color coded: green (success) / red (error) / yellow (info)
- X button to dismiss immediately
- Used on: Login success, Profile save, Booking updates, Tour join, Payment confirmation

---

## 📁 Project Structure

```
SafeJourney/
├── README.md
├── journeyshield-backend/
│   ├── server.js                         # Entry point — Express + Socket.io + self-ping
│   ├── config/
│   │   └── db.js                         # MongoDB Atlas connection
│   ├── controllers/                      # Business logic (15 controllers)
│   │   ├── userController.js             # Auth, OTP via Brevo, profiles
│   │   ├── bookingController.js          # Booking CRUD
│   │   ├── chatController.js             # Chat requests, messages, reactions
│   │   ├── paymentController.js          # Payment lifecycle & timeline
│   │   ├── reviewController.js           # Guide reviews
│   │   ├── tourController.js             # Group tours
│   │   ├── guideController.js            # Guide profile management
│   │   ├── placesController.js           # TomTom POI search
│   │   ├── geocodeController.js          # City → coordinates
│   │   ├── routeController.js            # Safe route planning
│   │   ├── safetyReportController.js     # Safety scores & incidents
│   │   ├── alertController.js            # Weather alerts
│   │   ├── searchController.js           # Global search + Ticketmaster events
│   │   └── incidentController.js         # Incident reporting
│   ├── models/                           # Mongoose schemas (13 models)
│   │   ├── userModel.js                  # TTL: none
│   │   ├── guideModel.js                 # TTL: none
│   │   ├── bookingModel.js               # TTL: none
│   │   ├── messageModel.js               # TTL: 60 days ⏱️
│   │   ├── conversationModel.js          # TTL: none
│   │   ├── chatRequestModel.js           # TTL: none
│   │   ├── chatLogModel.js               # Permanent security audit log
│   │   ├── paymentModel.js               # TTL: 6 months ⏱️
│   │   ├── reviewModel.js                # TTL: none
│   │   ├── tourModel.js                  # TTL: none
│   │   ├── otpModel.js                   # TTL: 5 minutes ⏱️
│   │   ├── incidentModel.js              # TTL: none
│   │   └── alertModel.js                 # TTL: none
│   ├── routes/                           # API route files (14 files)
│   │   ├── userRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── tourRoutes.js
│   │   ├── guideRoutes.js
│   │   ├── safetyReportRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── placesRoutes.js
│   │   ├── geocodeRoutes.js
│   │   ├── routeRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── incidentRoutes.js
│   │   └── weatherRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js             # JWT token verification
│   ├── socket/
│   │   └── socketHandlers.js             # Real-time event handlers
│   ├── data/
│   │   └── incidentSeeder.js             # Seed safety incident data
│   ├── seeder.js                         # Database seeder script
│   ├── package.json
│   └── .env                              # ⚠️ Never commit this file
│
└── journeyshield-frontend/
    ├── vercel.json                        # SPA routing fix for Vercel
    ├── src/
    │   ├── App.jsx                        # All route definitions
    │   ├── main.jsx                       # React entry point
    │   ├── index.css                      # Global styles + Google Fonts
    │   ├── pages/                         # 16 page components
    │   │   ├── HomePage.jsx               # Landing page
    │   │   ├── Login.jsx                  # Login with server wake ping
    │   │   ├── Registration.jsx           # OTP registration with wake ping
    │   │   ├── Dashboard.jsx              # Traveler dashboard
    │   │   ├── GuideDashboard.jsx         # Guide dashboard + tour management
    │   │   ├── Guides.jsx                 # Guide discovery + booking modal
    │   │   ├── MyBookings.jsx             # Booking + payment + review UI
    │   │   ├── Chat.jsx                   # Full chat with media support
    │   │   ├── Discover.jsx               # TomTom map + POI search
    │   │   ├── Alerts.jsx                 # Safety alerts + weather
    │   │   ├── GroupTours.jsx             # Group tour listing + join
    │   │   ├── Myprofile.jsx              # Profile viewer (both roles)
    │   │   ├── EditProfile.jsx            # Guide profile editor
    │   │   ├── TravelerEditProfile.jsx    # Traveler profile editor
    │   │   ├── GuideReviews.jsx           # Guide's received reviews
    │   │   └── Guideviewtravelerprofile.jsx # Guide views traveler
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Toast.jsx              # Global toast notification
    │   │   │   └── ProtectedRoute.jsx     # JWT-gated route wrapper
    │   │   └── layout/
    │   │       └── Navbar.jsx             # Top nav with unread badge
    │   └── services/                      # API call abstractions
    │       ├── bookingService.js          # Bookings + payment API calls
    │       ├── chatService.js             # Chat + messages
    │       ├── reviewService.js           # Reviews
    │       ├── tourService.js             # Group tours
    │       ├── alertService.js            # Safety reports
    │       ├── authService.js             # Login/register
    │       ├── geocodeService.js          # Geocoding
    │       └── routeService.js            # Route planning
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
```
Node.js v18+
npm v9+
MongoDB Atlas account (free tier)
Cloudinary account (free tier)
Brevo account (free tier)
TomTom developer account (free tier)
OpenWeather account (free tier)
```

### 1. Clone the repository
```bash
git clone https://github.com/suyashdubey31engiaz-prog/JourneyShield.git
cd JourneyShield
```

### 2. Install Backend Dependencies
```bash
cd journeyshield-backend
npm install
```

### 3. Configure Backend Environment
Create `journeyshield-backend/.env` — see [Environment Variables](#environment-variables)

### 4. Start Backend
```bash
npm run dev        # Development with nodemon (auto-restart)
# OR
npm start          # Production
```
Backend runs at `http://localhost:5000`

### 5. Install Frontend Dependencies
```bash
cd ../journeyshield-frontend
npm install
```

### 6. Configure Frontend Environment
Create `journeyshield-frontend/.env` — see [Environment Variables](#environment-variables)

### 7. Start Frontend
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## 📜 Available Scripts

### Backend (`journeyshield-backend/`)
```bash
npm start          # Run with node (production)
npm run dev        # Run with nodemon (development, auto-restart)
npm run data:import  # Seed database with sample data
npm run data:destroy # Remove all seeded data
```

### Frontend (`journeyshield-frontend/`)
```bash
npm run dev        # Start development server
npm run build      # Build for production (run before every git push)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## 🔐 Environment Variables

### Backend (`journeyshield-backend/.env`)
```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/JourneyShield?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_random_secret_string_minimum_32_characters
PORT=5000

# Email OTP — Use Brevo HTTP API (NOT nodemailer/SMTP — blocked on Render)
BREVO_API_KEY=xkeysib-your-brevo-api-key-here
BREVO_SENDER_EMAIL=your-verified-sender@gmail.com

# Maps & Location
TOMTOM_API_KEY=your_tomtom_api_key
FOURSQUARE_API_KEY=your_foursquare_api_key

# Weather
OPENWEATHER_API_KEY=your_openweather_api_key

# Events
TICKETMASTER_API_KEY=your_ticketmaster_api_key
```

### Frontend (`journeyshield-frontend/.env`)
```env
# Backend URL (change to Render URL for production)
VITE_API_URL=http://localhost:5000

# Cloudinary (for media uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

> ⚠️ **Critical Notes:**
> - `.env` files are in `.gitignore` — **never commit them**
> - `VITE_` variables are baked in at **build time** — changing them on Vercel requires a redeploy
> - For Vercel: set `VITE_API_URL` to `https://journeyshield-api.onrender.com`
> - For Render: add all backend env vars in Render Dashboard → Environment

---

## 📡 API Documentation

All routes marked 🔒 require header: `Authorization: Bearer <jwt_token>`

### Auth & Users `/api/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/send-otp` | ❌ | Generate 6-digit OTP, send via Brevo |
| POST | `/verify-register` | ❌ | Verify OTP, create User + Guide profile |
| POST | `/login` | ❌ | Verify credentials, return JWT |
| GET | `/me` | 🔒 | Get own full profile |
| PUT | `/me` | 🔒 | Update traveler profile |
| GET | `/guides` | ❌ | List all guides with profiles |
| GET | `/guide/:userId` | 🔒 | View guide's public profile |
| GET | `/traveler/:userId` | 🔒 | Guide views limited traveler info |

### Guides `/api/guides`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | 🔒 | List all guides (full profiles) |
| GET | `/me` | 🔒 | Get own guide profile |
| PUT | `/profile` | 🔒 | Update guide profile fields |

### Bookings `/api/bookings`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | 🔒 | Create booking request |
| GET | `/mybookings` | 🔒 | Traveler's booking history |
| GET | `/guidebookings` | 🔒 | Guide's received requests |
| PUT | `/:id/status` | 🔒 | Accept / Reject / Complete |

### Payments `/api/payments`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/initiate` | 🔒 | Traveler initiates payment, creates timeline |
| PUT | `/:bookingId/traveler-confirm` | 🔒 | Traveler confirms payment sent |
| PUT | `/:bookingId/guide-confirm` | 🔒 | Guide confirms received → booking completes |
| GET | `/:bookingId` | 🔒 | Get payment record + full timeline |

### Chat `/api/chat`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/request` | 🔒 | Traveler sends chat access request |
| GET | `/request/status/:toUserId` | 🔒 | Check if request is pending/accepted |
| GET | `/requests/pending` | 🔒 | Guide's pending chat requests |
| PUT | `/request/:requestId` | 🔒 | Guide accepts or rejects |
| GET | `/conversations` | 🔒 | All conversations for user |
| GET | `/messages/:conversationId` | 🔒 | Paginated message history |
| POST | `/messages` | 🔒 | Send message (all types) |
| POST | `/messages/:messageId/react` | 🔒 | Toggle emoji reaction |
| GET | `/unread-count` | 🔒 | Total unread for navbar badge |

### Reviews `/api/reviews`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | 🔒 | Create or update review (completed bookings only) |
| GET | `/:guideId` | ❌ | All public reviews for a guide |
| GET | `/:guideId/my` | 🔒 | My own review for this guide |

### Group Tours `/api/tours`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | List all open tours |
| POST | `/` | 🔒 | Guide creates a tour |
| DELETE | `/:id` | 🔒 | Guide cancels tour |
| POST | `/:id/join` | 🔒 | Traveler joins tour |
| POST | `/:id/kick` | 🔒 | Guide removes a participant |

### Safety & Location
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/safety` | ❌ | Safety report by `?city=Mumbai` |
| GET | `/api/safety/current` | ❌ | Safety report by `?lat=&lon=` |
| GET | `/api/safety/incidents` | ❌ | All incident reports |
| GET | `/api/weather/:city` | ❌ | Weather data for city |
| GET | `/api/places` | ❌ | TomTom POI search |
| GET | `/api/geocode` | ❌ | City name to coordinates |
| GET | `/api/alerts` | ❌ | Weather alerts |
| GET | `/api/search` | ❌ | Global search + events |
| GET | `/api/incidents` | 🔒 | Report/view incidents |

---

## 🗄️ Database Models

| Model | Collection | TTL | Key Fields |
|-------|-----------|-----|-----------|
| User | users | Never | name, email, role, avatar, emergencyContact |
| Guide | guides | Never | user (ref), pricePerHour, languages, specialties, rating |
| Booking | bookings | Never | traveler, guide, status, date, groupMembers, isReviewed |
| Message | messages | **60 days** | conversation, sender, type, text, fileUrl, reactions, readBy |
| Conversation | conversations | Never | participants[2], lastMessage, lastMessageAt |
| ChatRequest | chatrequests | Never | from, to, status, message |
| ChatLog | chatlogs | Never | Security audit — no message content stored |
| Payment | payments | **6 months** | booking, amount, method, status, timeline[] |
| Review | reviews | Never | guide, traveler, booking, rating, comment, editCount |
| Tour | tours | Never | guide, title, date, maxParticipants, participants[], status |
| OTP | otps | **5 minutes** | email, otp, createdAt |
| Incident | incidents | Never | city, type, severity, description, location |
| Alert | alerts | Never | city, type, message, severity |

---

## ⚡ Real-Time Architecture

Socket.io server runs on the same port as Express using a shared `httpServer`.

**Connection & Room Strategy:**
```
User opens app
  → Socket connects with JWT token in handshake.auth
  → Server verifies JWT → sets socket.userId
  → socket.join(socket.userId)  ← personal room for targeted events
  → When entering chat: socket.join('conv:' + conversationId)
```

**Message Delivery:**
```
Traveler sends message
  → Client emits 'sendMessage' with { conversationId, text }
  → Server saves to MongoDB
  → io.to('conv:' + conversationId).emit('newMessage', data)  ← both users in room
  → io.to(recipientUserId).emit('newMessage', data)           ← targeted backup
```

### All Socket Events
| Direction | Event | Description |
|-----------|-------|-------------|
| Client → Server | `joinConversation` | Join conversation room |
| Client → Server | `leaveConversation` | Leave conversation room |
| Client → Server | `sendMessage` | Send a message |
| Client → Server | `typing` | Broadcast typing indicator |
| Client → Server | `stopTyping` | Clear typing indicator |
| Client → Server | `markRead` | Mark messages as read |
| Server → Client | `newMessage` | New message delivered |
| Server → Client | `messageReaction` | Emoji reaction updated |
| Server → Client | `messagesRead` | Read receipts updated |
| Server → Client | `userTyping` | Other user is typing |
| Server → Client | `userStoppedTyping` | Typing stopped |
| Server → Client | `requestUpdate` | Chat request accepted/rejected |

---

## 💳 Payment System

### Current Flow (Cash Mode)
```
1. Guide accepts booking
2. Traveler clicks "💳 Initiate Payment"
3. Selects method:
   - Cash (Offline) ✅ — fully working
   - UPI / Online 🚧 — "Coming Soon" (Razorpay architecture ready)
4. Payment record created in MongoDB with step 1 of timeline
5. Traveler clicks "✅ I've Paid — Confirm Payment Sent"
6. Guide clicks "🎯 Confirm Payment Received & Complete Tour"
7. Booking auto-marked Completed → Review button unlocked
8. Both can view full timeline tracker anytime
```

### Receipt Format (Cash Mode)
```
🧾 Payment Receipt — JourneyShield · INR · Cash
─────────────────────────────────────────────
Booking Amount                        ₹500.00
Payment Method                           Cash
─────────────────────────────────────────────
Guide Receives                        ₹500.00
─────────────────────────────────────────────
💡 Platform fee & GST applied when online payment enabled
```

### Future Razorpay Integration
When business KYC is approved, only these changes needed:
- Register with Razorpay (free, 2% per transaction)
- Update `calcBreakdown()` in `paymentController.js`:
  - Platform fee: 5% of total
  - GST: 18% on platform fee only
  - Guide receives: total − platformFee − gstOnFee
- Add 2 new routes: `/create-order` and `/verify`
- Replace "I've Paid" button with Razorpay checkout popup

---

## 🚢 Deployment

### Frontend — Vercel
```bash
# Auto-deploys on every push to main branch
# Manual deploy via Vercel dashboard if needed

# Required environment variables on Vercel:
VITE_API_URL = https://journeyshield-api.onrender.com
VITE_CLOUDINARY_CLOUD_NAME = your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET = your_preset
```

**vercel.json** (fixes 404 on page refresh for SPA):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend — Render
```bash
# Build Command: npm install
# Start Command: node server.js
# Node Version:  22 (auto-detected)

# Required environment variables on Render:
MONGO_URI, JWT_SECRET, BREVO_API_KEY, BREVO_SENDER_EMAIL,
TOMTOM_API_KEY, OPENWEATHER_API_KEY, TICKETMASTER_API_KEY,
FOURSQUARE_API_KEY
```

### Keep-Alive Strategy (Prevents Render Free Tier Sleep)
```
Self-ping (server.js)
  → setInterval every 4 minutes
  → fetch('https://journeyshield-api.onrender.com/')
  → Runs inside the server process itself
  → Works independently of external monitors

UptimeRobot (external)
  → HTTP monitor pings every 5 minutes
  → Sends email alert if server goes down
  → Acts as backup + notification system

Together: server never sleeps, 99.9%+ uptime on free tier
```

---

## 🔀 Git Workflow

**Professional workflow used throughout this project:**

```bash
# Before every push — mandatory steps:

# Step 1 — Build test (must pass with 0 errors)
cd journeyshield-frontend
npm run build

# Step 2 — Review what changed
cd ..
git status                    # See which files changed
git diff <filename>           # Read exact line changes (q to exit)

# Step 3 — Stage specific files (never blindly stage everything)
git add journeyshield-frontend/src/pages/Login.jsx
git add journeyshield-backend/controllers/userController.js

# Step 4 — Commit with descriptive message
git commit -m "type: short description"

# Step 5 — Push
git push origin main

# Step 6 — Verify on Vercel/Render
# Wait for green deployment, then test on live site
```

**Commit message types:**
```
feat:     new feature added
fix:      bug fix
refactor: code restructure, no behavior change
chore:    dependency updates, config changes
style:    CSS/UI only changes
docs:     documentation updates
```

**Emergency commands:**
```bash
# Undo last commit (not yet pushed)
git reset --soft HEAD~1

# Undo last commit (already pushed — safe)
git revert HEAD
git push origin main

# Check if .env was ever committed
git log --all --full-history -- "journeyshield-backend/.env"

# Remove file from git tracking (keep local copy)
git rm --cached journeyshield-backend/.env
```

---

## 🧩 Challenges Faced & Solutions

### Challenge 1 — SMTP Blocked on Render Free Tier
**Problem:** Configured Gmail + nodemailer for OTP emails. Every attempt on the live server resulted in `ETIMEDOUT`. Render blocks all outbound TCP on ports 465 (SSL) and 587 (STARTTLS) to prevent spam abuse. This is permanent — no configuration change can fix it.

**What I tried first:** Gmail App Password → ETIMEDOUT. Brevo SMTP (port 587) → ETIMEDOUT. Brevo SMTP (port 465) → ETIMEDOUT. Resend SDK → ESM import errors.

**Final Solution:** Direct `axios.post()` to Brevo's REST API at `https://api.brevo.com/v3/smtp/email`. Uses HTTPS port 443 which is never blocked. No SDK needed — axios was already installed.

**Key lesson:** On any cloud free tier, never use SMTP. Always use HTTP-based email APIs. The service itself doesn't matter — what matters is that it uses HTTP, not TCP SMTP.

---

### Challenge 2 — Render Free Tier Sleeping (Error 521)
**Problem:** Render free tier suspends services after 15 minutes of inactivity. Users hitting a sleeping server get a Cloudflare 521 error or a 30-60 second timeout that looks like "wrong credentials."

**Confusion caused:** Users thought login was failing due to wrong password when it was actually a cold-start timeout.

**Solution (layered):**
1. `setInterval` self-ping inside `server.js` every 4 minutes — server keeps itself awake
2. UptimeRobot external monitor every 5 minutes — external backup + alerts
3. "Server is waking up..." banner on Login and Register pages — user feedback during cold start
4. 60-second axios timeout — handles rare cases when both ping systems miss

**Key lesson:** Free hosting has real limitations. Layer multiple strategies and always give users clear feedback. Never let a timeout silently look like an auth failure.

---

### Challenge 3 — Vercel 404 on Page Refresh
**Problem:** React SPA. Refreshing `/profile` on Vercel returned a 404 because no actual file exists at that path — Vercel looked for a file, found nothing.

**Solution:** `vercel.json` with one rewrite rule:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
This tells Vercel to always serve `index.html` and let React Router handle routing client-side.

**Key lesson:** Every React/Vue/Angular SPA deployed on Vercel needs this file. Deploy and immediately test refresh on every route.

---

### Challenge 4 — Case-Sensitive Imports Broke Vercel Build
**Problem:** File named `Myprofile.jsx` but imported as `./pages/MyProfile`. Windows is case-insensitive — worked locally. Linux (Vercel) is case-sensitive — fatal build error.

**Symptoms:** Build failed on Vercel with "Could not resolve ./pages/MyProfile" but worked perfectly on localhost for weeks.

**Solution:** Fixed import to `./pages/Myprofile` (exact filename case).

**Key lesson:** Always match import paths to exact filenames. Run `npm run build` locally before pushing — it catches this. If you use Windows for development, treat all filenames as case-sensitive.

---

### Challenge 5 — VITE_API_URL is Build-Time, Not Runtime
**Problem:** Added `VITE_API_URL` to Vercel environment variables. Frontend still called `localhost:5000`. No error anywhere — it just silently used the default fallback.

**Root cause:** `VITE_` prefixed variables are compiled into the JavaScript bundle at build time using Rollup. They are not environment variables read at runtime like Node.js `process.env`. Changing them on Vercel only takes effect in the **next build**.

**Solution:** After setting the env var, always trigger a new deploy — either push a new commit or use "Redeploy" in Vercel dashboard.

**Key lesson:** Understand the difference between build-time and runtime environment variables. `VITE_` = build-time (React/Vite). `process.env` = runtime (Node.js).

---

### Challenge 6 — Hardcoded localhost in bookingService
**Problem:** `bookingService.js` had `const API_URL = 'http://localhost:5000/api/bookings'` hardcoded. Booking requests worked on localhost, failed silently on live with no useful error.

**How found:** Network tab showed requests going to localhost from the Vercel-hosted site.

**Solution:** Changed to `(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/bookings'`

**Key lesson:** Search all service files for `localhost` before first deployment. Use environment variables for every URL. This pattern should be the only URL pattern in any service file.

---

### Challenge 7 — WebRTC Voice Calls — Complete Failure & Removal
**Problem:** Built a full WebRTC voice call system with Socket.io signaling, ICE candidate exchange, and RTCPeerConnection. Never reliably connected even on localhost between two browser tabs.

**Issues encountered:** ICE gathering timeouts, React StrictMode double-invoking useEffect creating duplicate connections, WebSocket instability causing missed signaling events, race conditions in offer/answer exchange.

**Decision:** Removed the entire feature after 2+ days of debugging. A broken feature damages user trust more than a missing feature.

**Key lesson:** WebRTC peer-to-peer requires STUN/TURN infrastructure, extensive network testing, and dedicated SDKs (Twilio, Agora, Daily.co). Don't attempt raw WebRTC without proper infrastructure. Scope features realistically.

---

### Challenge 8 — Resend API Free Tier Restriction
**Problem:** Switched to Resend for emails. Logs showed "sent successfully" but no emails arrived. After investigation: Resend free tier only allows sending to the **single email address used during Resend signup** — cannot send to any other recipient without a verified custom domain.

**Key lesson:** Always test email delivery with 3+ different email addresses before declaring it "working." Read service free tier restrictions completely before integrating.

---

### Challenge 9 — Brevo Sender Verification Required
**Problem:** Even after switching to Brevo and getting "sent successfully" in logs, emails landed in a different account or didn't arrive. Root cause: the sender email (`dubeylooser@gmail.com`) wasn't verified in Brevo's Senders list.

**Solution:** Brevo → Settings → Senders → Add sender → verify via email link. After verification, delivery worked correctly.

**Key lesson:** Every email service requires sender verification. "API key works" ≠ "email will be delivered." Verify the sender domain/address separately.

---

### Challenge 10 — .env File Exposed in Project Dump
**Problem:** Shared a project dump text file for debugging that included actual `.env` contents — MongoDB URI with password, JWT secret, all API keys.

**Immediate response:** Rotated all credentials immediately:
- MongoDB Atlas → Database Access → changed password
- Brevo → regenerated API key
- All other API keys regenerated

**Verification:** `git log --all --full-history -- ".env"` to confirm `.env` was never in git history.

**Key lesson:** Never share project dumps or screenshots containing `.env` contents. Rotate credentials immediately if exposed anywhere. Regularly audit what's in your `.gitignore`.

---

### Challenge 11 — Dynamic Import Inside useEffect Caused Blank Page
**Problem:** Used `import('../services/bookingService')` inside a `useEffect` to load `getPayment` function. Past bookings tab rendered completely blank — no error, no loading state, just black screen.

**Root cause:** Dynamic import inside useEffect creates a race condition. The component tries to render before the import resolves. Combined with a wrong function name (`getMyReviewForGuide` instead of `getMyReview`), the component crashed silently.

**Solution:** Moved all imports to the top of the file as static imports. Fixed function name to match what reviewService actually exports.

**Key lesson:** Never use dynamic `import()` inside `useEffect` for service functions. Always use static imports. When a page goes blank, check the browser console Network tab for 404 errors on imported modules.

---

### Challenge 12 — Socket.io Auth on Free Render (Connection Drops)
**Problem:** Socket connections would randomly disconnect on the live site. Users would lose typing indicators and miss messages without knowing it.

**Root cause:** Render free tier has aggressive connection timeout. Long-lived TCP connections (Socket.io) get killed after periods of inactivity.

**Solution:** Socket.io client configured with `reconnection: true`, `reconnectionDelay: 1000`, and the server re-joins users to their rooms on reconnect via the `connect` event handler on the client side.

**Key lesson:** WebSocket connections on free hosting are unreliable. Always implement reconnection logic and re-join room subscriptions on reconnect.

---

## ⛔ What to Avoid

### Development Practices
| ❌ Avoid | ✅ Do Instead |
|---------|-------------|
| `git add .` blindly | Review `git status` and `git diff` first |
| Pushing without building | Always run `npm run build` first |
| Hardcoding `localhost:5000` | Use `import.meta.env.VITE_API_URL` |
| Committing `.env` files | Verify `.gitignore` before every project |
| Dynamic `import()` in `useEffect` | Static imports at file top |
| Windows-only filename testing | Match exact case in all import paths |
| Generic commit messages ("fix", "update") | Specific messages ("fix: SMTP timeout on Render") |
| Testing email with only your own address | Test with 3+ different email addresses |
| Sharing screenshots with credentials | Rotate keys immediately if exposed |
| Leaving unused packages in `package.json` | `npm uninstall` unused dependencies |

### Architecture Decisions to Avoid
- **SMTP on free cloud hosting** — always use HTTP-based email APIs (Brevo, SendGrid)
- **Raw WebRTC without infrastructure** — use Twilio, Agora, or Daily.co instead
- **Storing media in MongoDB** — use Cloudinary, S3, or similar CDN services
- **Single keep-alive strategy** — layer self-ping + external monitor
- **`service: 'gmail'` in nodemailer on cloud** — it uses SMTP which is blocked
- **Resend free tier for multi-recipient email** — requires paid plan or custom domain
- **Build-time env vars changed without redeploying** — `VITE_` vars need a new build
- **Dynamic imports in render logic** — causes silent blank screens

### Security Practices
- **Never store plain text passwords** — always bcrypt with minimum 10 salt rounds
- **Never skip JWT verification on Socket.io** — every connection must verify token
- **Never expose stack traces in API errors** — use generic messages in production
- **Never use the same email for OTP sender and recipient testing**
- **Always use `git rm --cached` to untrack accidentally committed files**
- **Rotate all credentials immediately** if they appear in any public file or screenshot

---

## 🔮 Future Improvements

### High Priority
| Feature | Description |
|---------|-------------|
| Razorpay Payment Gateway | Business KYC → 2% transaction fee → 5% platform commission. Code structure already in place |
| Custom Domain + Email | Buy domain → verify on Brevo → remove all email sending restrictions |
| Upgrade Render ($7/month) | Eliminates sleep entirely — guaranteed uptime, no keep-alive needed |

### Medium Priority
| Feature | Description |
|---------|-------------|
| Push Notifications | Firebase Cloud Messaging for booking alerts, chat messages |
| Guide Verification System | Document upload + admin review workflow |
| Admin Dashboard | Monitor users, bookings, payments, revenue analytics |
| Advanced Safety Map | Color-coded safety zones overlaid on TomTom map |
| Multi-language Support | Hindi and regional Indian languages (i18n) |

### Low Priority
| Feature | Description |
|---------|-------------|
| Mobile App | React Native with shared Node.js backend |
| Guide Calendar | Availability management with date blocking |
| Video Calls | Twilio or Agora integration (proper infrastructure) |
| AI Safety Recommendations | ML model for route safety scoring |
| Group Chat | Multi-participant conversations for group tours |

---

## 📊 Project Statistics

```
Backend:  15 controllers | 13 models | 14 route files | 1 socket handler
Frontend: 16 pages | 8 services | 3 components | 1 utility hook
Database: 13 collections | 3 TTL indexes | 10+ compound queries
APIs:     10 external services integrated
Commits:  50+ with conventional commit messages
```

---

## 👤 Author

**Suyash Dubey**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/suyashdubey)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com/suyashdubey31engiaz-prog)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=flat&logo=gmail)](mailto:suyashdubey31engiaz@gmail.com)

---

## 📄 License

This project is built for educational and portfolio purposes.

---

<div align="center">

**⭐ Star this repository if you found it helpful**

Built with ❤️ and a lot of debugging by Suyash Dubey

*JourneyShield — Travel Safe, Explore More* 🛡️

</div>