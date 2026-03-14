import React, { useState, useEffect } from 'react';
import { getTours, joinTour } from '../services/tourService';
import Toast from '../components/common/Toast';

const statusStyle = (s) => ({
  Open:      'bg-green-900/40 text-green-400 border-green-800/50',
  Full:      'bg-red-900/40   text-red-400   border-red-800/50',
  Completed: 'bg-blue-900/40  text-blue-400  border-blue-800/50',
}[s] || 'bg-gray-800 text-gray-400 border-gray-700');

const GroupTours = () => {
  const [tours,   setTours]   = useState([]);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [toast,   setToast]   = useState(null);
  const [filter,  setFilter]  = useState('All');

  useEffect(() => {
    setUser(JSON.parse(sessionStorage.getItem('user')));
    getTours()
      .then(d => setTours(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const flash = (msg, type = 'info') => setToast({ message: msg, type });

  const handleJoin = async (tourId) => {
    if (!user) return flash('Please log in to join a tour.', 'info');
    setJoining(tourId);
    try {
      await joinTour(tourId, user.token);
      flash('✅ Successfully joined the tour!', 'success');
      const d = await getTours();
      setTours(d);
    } catch (e) {
      flash(e.response?.data?.message || 'Failed to join tour.', 'error');
    } finally { setJoining(null); }
  };

  const isJoined  = (t) => t.travelers?.some(x => x._id === user?._id);
  const isFull    = (t) => t.travelers?.length >= t.maxParticipants;
  const isOwn     = (t) => t.guide?._id === user?._id;
  const capPct    = (t) => Math.min(100, Math.round((t.travelers?.length / t.maxParticipants) * 100));

  const shown = tours.filter(t => filter === 'All' || t.status === filter);

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="h-8 bg-gray-800 animate-pulse rounded w-48 mb-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-gray-800 animate-pulse rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl text-white animate-fadeIn">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Group Tours</h1>
          <p className="text-gray-400 text-sm mt-1">
            Join a public tour led by verified local guides · {tours.length} available
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All','Open','Full'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                filter === f
                  ? 'bg-yellow-500 border-yellow-500 text-black'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-500/40'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="text-xl font-bold text-white mb-2">No tours available</p>
          <p className="text-gray-500 text-sm">Check back soon or try a different filter.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map(tour => (
            <div key={tour._id}
              className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden flex flex-col hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">

              {/* Accent top bar */}
              <div className={`h-1.5 ${
                tour.status === 'Full' ? 'bg-red-500' :
                tour.status === 'Completed' ? 'bg-blue-500' : 'bg-gradient-to-r from-yellow-500 to-amber-400'
              }`} />

              <div className="p-5 flex flex-col flex-grow">

                {/* Title + status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-extrabold text-white text-base leading-snug">{tour.title}</h3>
                  <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusStyle(tour.status)}`}>
                    {tour.status}
                  </span>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">{tour.description}</p>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  {[
                    { icon: '📍', val: tour.location },
                    { icon: '📅', val: new Date(tour.fixedDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) },
                    { icon: '👤', val: tour.guide?.name || 'Guide' },
                    { icon: '💰', val: `$${tour.pricePerPerson} / person` },
                  ].map(({ icon, val }) => (
                    <div key={icon} className="flex items-center gap-1.5 bg-gray-900/50 rounded-lg px-2.5 py-2 min-w-0">
                      <span>{icon}</span>
                      <span className="text-gray-300 truncate">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Capacity bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Capacity</span>
                    <span className="font-bold text-white">{tour.travelers?.length ?? 0} / {tour.maxParticipants}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      capPct(tour) >= 90 ? 'bg-red-500' :
                      capPct(tour) >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} style={{ width: `${capPct(tour)}%` }} />
                  </div>
                </div>

                {/* Traveler avatars */}
                {(tour.travelers?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {tour.travelers.slice(0, 5).map(t => (
                        <div key={t._id}
                          className="w-6 h-6 rounded-full bg-cyan-700 border-2 border-gray-800 flex items-center justify-center text-[10px] font-bold text-white"
                          title={t.name}>
                          {t.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {tour.travelers.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-[10px] text-gray-300 font-bold">
                          +{tour.travelers.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs">{tour.travelers.length} joined</span>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-auto">
                  {user?.role === 'Guide' ? (
                    <button disabled
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-gray-700/50 text-gray-500 border border-gray-700 cursor-not-allowed">
                      {isOwn(tour) ? '🎯 Your Tour' : '🔒 Guides Cannot Join'}
                    </button>
                  ) : isJoined(tour) ? (
                    <button disabled
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-green-900/40 text-green-400 border border-green-800/50 cursor-not-allowed">
                      ✅ Already Joined
                    </button>
                  ) : isFull(tour) ? (
                    <button disabled
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-gray-700/50 text-gray-500 border border-gray-700 cursor-not-allowed">
                      🔴 Tour Full
                    </button>
                  ) : (
                    <button onClick={() => handleJoin(tour._id)} disabled={joining === tour._id}
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-yellow-500 hover:bg-yellow-400 text-black transition-all shadow-md shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-70">
                      {joining === tour._id
                        ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Joining…</>
                        : '🚀 Join Group'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupTours;
//--- File: C:\Users\Suyash Dubey\OneDrive\Desktop\SafeJourney\journeyshield-frontend\src\pages\GuideDashboard.jsx ---