import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar         from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage            from './pages/HomePage';
import Login               from './pages/Login';
import Registration        from './pages/Registration';
import Dashboard           from './pages/Dashboard';
import Alerts              from './pages/Alerts';
import MyBookings          from './pages/MyBookings';
import GroupTours          from './pages/GroupTours';
import Discover            from './pages/Discover';
import Guides              from './pages/Guides';
import TravelerEditProfile from './pages/TravelerEditProfile';
import GuideDashboard      from './pages/GuideDashboard';
import GuideReviews        from './pages/GuideReviews';
import EditProfile         from './pages/EditProfile';

function App() {
  return (
    <div className="min-h-screen bg-[#111827]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/group-tours" element={<GroupTours />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/alerts"    element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/bookings"  element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/discover"  element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/guides"    element={<ProtectedRoute><Guides /></ProtectedRoute>} />

          {/* Traveler */}
          <Route path="/edit-traveler-profile" element={<ProtectedRoute><TravelerEditProfile /></ProtectedRoute>} />

          {/* Guide */}
          <Route path="/guide-dashboard" element={<ProtectedRoute><GuideDashboard /></ProtectedRoute>} />
          <Route path="/guide-reviews"   element={<ProtectedRoute><GuideReviews /></ProtectedRoute>} />
          <Route path="/edit-profile"    element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;