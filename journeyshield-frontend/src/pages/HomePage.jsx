import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, buttonText, link, accent }) => (
  <div className={`relative bg-gray-800/50 p-7 rounded-2xl border border-gray-700 text-left flex flex-col group hover:border-${accent}-500/60 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-${accent}-900/20`}>
    <div className={`w-12 h-12 rounded-xl bg-${accent}-500/10 border border-${accent}-500/20 flex items-center justify-center mb-5`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-400 mb-6 text-sm leading-relaxed flex-grow">{description}</p>
    <Link
      to={link}
      className={`inline-flex items-center gap-2 text-sm font-bold text-${accent}-400 hover:text-${accent}-300 transition-colors`}
    >
      {buttonText}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </Link>
  </div>
);

const StatBadge = ({ value, label }) => (
  <div className="text-center px-6 py-4 bg-gray-800/40 rounded-2xl border border-gray-700">
    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">{value}</p>
    <p className="text-sm text-gray-400 mt-1">{label}</p>
  </div>
);

const HomePage = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  return (
    <div className="min-h-screen">

      {/* HERO SECTION */}
      <div className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-wider">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Real-time Safety Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400">
              Journey
            </span>
            <span className="text-white"> Shield</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your intelligent travel companion — discover destinations, hire trusted local guides,
            and navigate with real-time safety insights.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link
                to={user.role === 'Guide' ? '/guide-dashboard' : '/dashboard'}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/30 hover:-translate-y-0.5"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/30 hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-700 transition-all hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </>
            )}
            <Link
              to="/group-tours"
              className="px-8 py-4 bg-gray-800/80 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-700 transition-all hover:-translate-y-0.5"
            >
              Browse Group Tours
            </Link>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <StatBadge value="50+" label="Cities Covered" />
          <StatBadge value="200+" label="Verified Guides" />
          <StatBadge value="Real-time" label="Safety Scores" />
          <StatBadge value="24/7" label="Incident Tracking" />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="container mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to travel safely</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Powerful tools designed for modern travelers who refuse to compromise on safety.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            accent="yellow"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="Discover Places"
            description="Search attractions, museums, parks and hidden gems in any city. Get routes plotted on an interactive live map with nearby incident overlays."
            buttonText="Explore the Map"
            link="/discover"
          />
          <FeatureCard
            accent="cyan"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
            }
            title="Hire Local Guides"
            description="Connect with verified local experts. Browse their bios, book private or group sessions, and travel with someone who knows the terrain."
            buttonText="Browse Guides"
            link="/guides"
          />
          <FeatureCard
            accent="green"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Safety Analytics"
            description="Get locality-based safety scores powered by live weather, traffic, and community-reported incidents. Know before you go."
            buttonText="Check Safety"
            link="/alerts"
          />
        </div>
      </div>

      {/* CTA BANNER */}
      {!user && (
        <div className="container mx-auto px-6 pb-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to travel smarter?</h2>
            <p className="text-gray-400 mb-8">Join thousands of travelers who trust Journey Shield for safe exploration.</p>
            <Link
              to="/register"
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 inline-block"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;