import React from 'react';
import { Link } from 'react-router-dom';

const FeatureLinkCard = ({ to, icon, title }) => (
  <Link to={to} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center aspect-square hover:border-yellow-400 hover:bg-gray-700/50 transition-colors">
    <div className="w-10 h-10 mb-2 text-yellow-400">{icon}</div>
    <span className="font-semibold text-sm text-gray-200">{title}</span>
  </Link>
);

const Dashboard = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  // Icons for our feature cards
  const DiscoverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const GuidesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.908 0M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const SafetyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
  const ReviewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m2.25-4.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" /></svg>;


  return (
    <div className="container mx-auto p-6 text-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">
          Welcome, <span className="text-yellow-400">{user?.name}</span>
        </h1>
        <p className="text-lg text-gray-400 mt-2">What would you like to do today?</p>
      </div>
      
      {/* Conditionally render dashboard icons based on user role */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {user?.role === 'Traveler' ? (
          <>
            <FeatureLinkCard to="/discover" icon={<DiscoverIcon />} title="Discover Places" />
            <FeatureLinkCard to="/guides" icon={<GuidesIcon />} title="Hire Guides" />
            <FeatureLinkCard to="/alerts" icon={<SafetyIcon />} title="Safety Alerts" />
          </>
        ) : (
          <>
            <FeatureLinkCard to="/discover" icon={<DiscoverIcon />} title="Discover Places" />
            <FeatureLinkCard to="/guide-reviews" icon={<ReviewsIcon />} title="View Reviews" />
            <FeatureLinkCard to="/alerts" icon={<SafetyIcon />} title="Safety Alerts" />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
