import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, buttonText, link }) => (
  <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700 text-left">
    <div className="flex items-center space-x-3 mb-3">
      {icon}
      <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-400 mb-4 text-sm">{description}</p>
    <Link to={link} className="inline-block bg-gray-700 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
      {buttonText}
    </Link>
  </div>
);

const HomePage = () => {
  return (
    <div className="container mx-auto px-6 py-12 text-center">
      <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
        Journey Shield
      </h1>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
        Your travel companion for safe, confident exploration—discover places, hire trusted guides, and receive local safety insights.
      </p>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            title="Discover Places" 
            description="Search attractions, museums and must-see spots in any city."
            buttonText="Explore Places"
            link="/discover"
        />
        <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-3-1.975 9 9 0 00-6 0m9 0a9 9 0 003 1.975M3 19a9 9 0 016-8.197" /></svg>}
            title="Hire Guides" 
            description="Connect with verified local guides. Browse ratings and availability."
            buttonText="Browse Guides"
            link="/guides"
        />
        <FeatureCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            title="Safety Alerts" 
            description="Get locality-based safety indicators and summaries so you can plan safer routes."
            buttonText="View Alerts"
            link="/alerts"
        />
      </div>
    </div>
  );
};

export default HomePage;
