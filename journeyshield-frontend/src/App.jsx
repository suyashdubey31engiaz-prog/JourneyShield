import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Registration from './pages/Registration';

// Protected Pages (Common)
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import MyBookings from './pages/MyBookings'; // New

// Protected Pages (Traveler)
import Discover from './pages/Discover';
import Guides from './pages/Guides';

// Protected Pages (Guide)
import GuideDashboard from './pages/GuideDashboard';
import GuideReviews from './pages/GuideReviews';
import EditProfile from './pages/EditProfile'; // New

function App() {
  return (
    <div className="min-h-screen bg-[#111827]">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          
          {/* General Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          {/* Traveler Specific Routes */}
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
          
          {/* Guide Specific Routes */}
          <Route path="/guide-dashboard" element={<ProtectedRoute><GuideDashboard /></ProtectedRoute>} />
          <Route path="/guide-reviews" element={<ProtectedRoute><GuideReviews /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;