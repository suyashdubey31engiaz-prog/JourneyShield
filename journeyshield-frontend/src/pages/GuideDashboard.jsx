import React from 'react';
import { Link } from 'react-router-dom';

// Reusable card component for dashboard links
const FeatureLinkCard = ({ to, icon, title }) => (
  <Link 
    to={to} 
    className="bg-gray-800/40 p-6 rounded-xl border border-gray-700 text-center flex flex-col items-center justify-center aspect-square hover:border-yellow-400 hover:bg-gray-700/50 transition-all group shadow-lg hover:shadow-yellow-500/10"
  >
    <div className="w-12 h-12 mb-3 text-yellow-400 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <span className="font-semibold text-gray-200 group-hover:text-white text-sm md:text-base">
      {title}
    </span>
  </Link>
);

const GuideDashboard = () => {
  // Retrieve user info from session storage
  const user = JSON.parse(sessionStorage.getItem('user'));

  // --- SVG ICONS ---
  
  // Icon for editing profile (Pencil/User)
  const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );

  // Icon for discovering places (Map/Compass)
  const DiscoverIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );

  // Icon for reviews (Star/Chat)
  const ReviewsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );

  // Icon for safety alerts (Shield)
  const SafetyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M3.75 12a8.25 8.25 0 0114.78-4.275 8.25 8.25 0 01-14.78 0z" />
    </svg>
  );

  return (
    <div className="container mx-auto p-6 text-white min-h-screen">
      
      {/* Header Section */}
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Welcome back, <span className="text-yellow-400">{user?.name}</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Manage your profile, check your reputation, and stay updated on local safety to provide the best experience for travelers.
        </p>
      </div>

      {/* Grid Menu Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
        
        {/* 1. Edit Profile */}
        <FeatureLinkCard 
          to="/edit-profile" 
          icon={<ProfileIcon />} 
          title="Edit Profile" 
        />

        {/* 2. Discover Places */}
        <FeatureLinkCard 
          to="/discover" 
          icon={<DiscoverIcon />} 
          title="Discover Places" 
        />

        {/* 3. View Reviews */}
        <FeatureLinkCard 
          to="/guide-reviews" 
          icon={<ReviewsIcon />} 
          title="View Reviews" 
        />

        {/* 4. Safety Alerts */}
        <FeatureLinkCard 
          to="/alerts" 
          icon={<SafetyIcon />} 
          title="Safety Alerts" 
        />

      </div>
    </div>
  );
};

export default GuideDashboard;