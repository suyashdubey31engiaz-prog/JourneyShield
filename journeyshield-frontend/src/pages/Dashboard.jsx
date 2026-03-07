import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ to, emoji, title, description, accent }) => {
  const colors = {
    yellow: 'hover:border-yellow-500/50 hover:shadow-yellow-900/20 [&>div]:bg-yellow-500/10 [&>div]:border-yellow-500/20 [&>div]:text-yellow-400',
    cyan:   'hover:border-cyan-500/50   hover:shadow-cyan-900/20   [&>div]:bg-cyan-500/10   [&>div]:border-cyan-500/20   [&>div]:text-cyan-400',
    green:  'hover:border-green-500/50  hover:shadow-green-900/20  [&>div]:bg-green-500/10  [&>div]:border-green-500/20  [&>div]:text-green-400',
    purple: 'hover:border-purple-500/50 hover:shadow-purple-900/20 [&>div]:bg-purple-500/10 [&>div]:border-purple-500/20 [&>div]:text-purple-400',
    amber:  'hover:border-amber-500/50  hover:shadow-amber-900/20  [&>div]:bg-amber-500/10  [&>div]:border-amber-500/20  [&>div]:text-amber-400',
    rose:   'hover:border-rose-500/50   hover:shadow-rose-900/20   [&>div]:bg-rose-500/10   [&>div]:border-rose-500/20   [&>div]:text-rose-400',
  };
  return (
    <Link to={to}
      className={`group bg-gray-800/50 p-5 rounded-2xl border border-gray-700 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${colors[accent]}`}>
      <div className="w-12 h-12 mb-3 rounded-xl border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
        {emoji}
      </div>
      <span className="font-bold text-gray-100 text-sm mb-1">{title}</span>
      <span className="text-xs text-gray-400 leading-relaxed">{description}</span>
    </Link>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-gray-800/40 border border-gray-700 rounded-xl px-5 py-4 text-center">
    <p className="text-xl font-bold text-yellow-400">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
  </div>
);

const Dashboard = () => {
  const user       = JSON.parse(sessionStorage.getItem('user'));
  const isTraveler = user?.role === 'Traveler';

  const travelerCards = [
    { to: '/discover',              emoji: '🗺️', title: 'Discover Places',  description: 'Explore spots on a live map',       accent: 'yellow' },
    { to: '/guides',                emoji: '👤', title: 'Hire Guides',       description: 'Browse verified local experts',     accent: 'cyan'   },
    { to: '/alerts',                emoji: '🛡️', title: 'Safety Alerts',    description: 'Check real-time safety scores',     accent: 'green'  },
    { to: '/bookings',              emoji: '📅', title: 'My Bookings',       description: 'Track & review your trips',         accent: 'purple' },
    { to: '/group-tours',           emoji: '👥', title: 'Group Tours',       description: 'Join or browse public tours',       accent: 'amber'  },
    { to: '/edit-traveler-profile', emoji: '✏️', title: 'Edit Profile',     description: 'Update your travel preferences',   accent: 'rose'   },
  ];

  const guideCards = [
    { to: '/discover',       emoji: '🗺️', title: 'Discover Places', description: 'Plan safe routes for clients',    accent: 'yellow' },
    { to: '/guide-reviews',  emoji: '⭐', title: 'My Reviews',      description: 'See traveler feedback',           accent: 'purple' },
    { to: '/alerts',         emoji: '🛡️', title: 'Safety Alerts',  description: 'Real-time area safety data',      accent: 'green'  },
    { to: '/bookings',       emoji: '📅', title: 'Booking Requests',description: 'Accept & complete bookings',      accent: 'cyan'   },
    { to: '/group-tours',    emoji: '👥', title: 'Group Tours',     description: 'Manage your hosted tours',        accent: 'amber'  },
    { to: '/edit-profile',   emoji: '✏️', title: 'Edit Profile',   description: 'Update your guide profile',       accent: 'rose'   },
  ];

  const cards = isTraveler ? travelerCards : guideCards;

  return (
    <div className="container mx-auto px-6 py-10 text-white max-w-5xl animate-fadeIn">

      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl font-extrabold text-yellow-400">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, <span className="text-yellow-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{user?.role} · {user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Stat label="Account Type" value={user?.role} />
        <Stat label="Platform"     value="JourneyShield" />
        <Stat label="Status"       value="Active ✅" />
      </div>

      {/* Cards */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cards.map((c) => <Card key={c.to} {...c} />)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;