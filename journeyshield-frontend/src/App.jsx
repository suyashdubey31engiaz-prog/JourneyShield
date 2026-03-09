import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar        from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage    from './pages/HomePage';
import Login       from './pages/Login';
import Registration from './pages/Registration';
import GroupTours  from './pages/GroupTours';

// Common Protected Pages
import Dashboard   from './pages/Dashboard';
import Alerts      from './pages/Alerts';
import MyBookings  from './pages/MyBookings';
import MyProfile   from './pages/Myprofile';

// Traveler Pages
import Discover    from './pages/Discover';
import Guides      from './pages/Guides';
import TravelerEditProfile from './pages/TravelerEditProfile';       // NEW

// Guide Pages
import GuideDashboard from './pages/GuideDashboard';
import GuideReviews   from './pages/GuideReviews';
import EditProfile    from './pages/EditProfile';                    // Guide edit profile (updated)
import Chat         from './pages/Chat';                               // NEW
import GuideViewTravelerProfile from './pages/Guideviewtravelerprofile';

function App() {
  return (
    <div className="min-h-screen bg-[#111827]">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Registration />} />
          <Route path="/group-tours" element={<GroupTours />} />

          {/* Common protected */}
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/alerts"      element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/bookings"    element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          {/* ── Profile routes (both roles) ── */}
          <Route path="/profile"     element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

          {/* Traveler specific */}
          <Route path="/discover"    element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/guides"      element={<ProtectedRoute><Guides /></ProtectedRoute>} />
          <Route path="/edit-traveler-profile"
                                     element={<ProtectedRoute><TravelerEditProfile /></ProtectedRoute>} />

          {/* Guide specific */}
          <Route path="/guide-dashboard"
                                     element={<ProtectedRoute><GuideDashboard /></ProtectedRoute>} />
          <Route path="/guide-reviews"
                                     element={<ProtectedRoute><GuideReviews /></ProtectedRoute>} />
          <Route path="/edit-profile"
                                     element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/chat"         element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/traveler/:userId"
                                     element={<ProtectedRoute><GuideViewTravelerProfile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*"            element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
//--- File: C:\Users\Suyash Dubey\OneDrive\Desktop\SafeJourney\journeyshield-frontend\src\index.css ---