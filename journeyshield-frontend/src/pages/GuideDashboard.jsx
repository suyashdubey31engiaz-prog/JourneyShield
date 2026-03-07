import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createTour, getTours, kickTraveler, cancelTour } from '../services/tourService';

/* ─── Quick Stats ─────────────────────────────────────────────────────────── */
const Stat = ({ label, value }) => (
  <div className="bg-gray-800/40 border border-gray-700 rounded-xl px-5 py-4 text-center">
    <p className="text-xl font-bold text-yellow-400">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
  </div>
);

/* ─── Dashboard Card (Link) ───────────────────────────────────────────────── */
const Card = ({ to, emoji, title, description, accent }) => {
  const ring = {
    yellow: 'hover:border-yellow-500/50 hover:shadow-yellow-900/20',
    cyan:   'hover:border-cyan-500/50   hover:shadow-cyan-900/20',
    green:  'hover:border-green-500/50  hover:shadow-green-900/20',
    purple: 'hover:border-purple-500/50 hover:shadow-purple-900/20',
    amber:  'hover:border-amber-500/50  hover:shadow-amber-900/20',
    rose:   'hover:border-rose-500/50   hover:shadow-rose-900/20',
    blue:   'hover:border-blue-500/50   hover:shadow-blue-900/20',
  };
  const icon = {
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    cyan:   'bg-cyan-500/10   border-cyan-500/20   text-cyan-400',
    green:  'bg-green-500/10  border-green-500/20  text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber:  'bg-amber-500/10  border-amber-500/20  text-amber-400',
    rose:   'bg-rose-500/10   border-rose-500/20   text-rose-400',
    blue:   'bg-blue-500/10   border-blue-500/20   text-blue-400',
  };
  return (
    <Link to={to}
      className={`group bg-gray-800/50 p-5 rounded-2xl border border-gray-700 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${ring[accent]}`}>
      <div className={`w-12 h-12 mb-3 rounded-xl border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${icon[accent]}`}>
        {emoji}
      </div>
      <span className="font-bold text-gray-100 text-sm mb-1">{title}</span>
      <span className="text-xs text-gray-400 leading-relaxed">{description}</span>
    </Link>
  );
};

/* ─── Dashboard Card (Button) ─────────────────────────────────────────────── */
const ActionCard = ({ onClick, emoji, title, description, accent }) => {
  const ring = {
    amber: 'hover:border-amber-500/50 hover:shadow-amber-900/20',
    blue:  'hover:border-blue-500/50  hover:shadow-blue-900/20',
  };
  const icon = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    blue:  'bg-blue-500/10  border-blue-500/20  text-blue-400',
  };
  return (
    <button onClick={onClick}
      className={`group bg-gray-800/50 p-5 rounded-2xl border border-gray-700 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full ${ring[accent]}`}>
      <div className={`w-12 h-12 mb-3 rounded-xl border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${icon[accent]}`}>
        {emoji}
      </div>
      <span className="font-bold text-gray-100 text-sm mb-1">{title}</span>
      <span className="text-xs text-gray-400 leading-relaxed">{description}</span>
    </button>
  );
};

/* ─── Tour Management Panel ───────────────────────────────────────────────── */
const TourManagement = ({ user, onBack }) => {
  const [myTours, setMyTours]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [formData, setFormData]   = useState({
    title: '', description: '', location: '',
    fixedDate: '', maxParticipants: 10, pricePerPerson: 50,
  });
  const [kickModal, setKickModal] = useState({
    isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '',
  });

  useEffect(() => { fetchTours(); }, []);

  const fetchTours = async () => {
    try {
      const all = await getTours();
      setMyTours(all.filter((t) => t.guide?._id === user._id));
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTour(formData, user.token);
      setFormData({ title: '', description: '', location: '', fixedDate: '', maxParticipants: 10, pricePerPerson: 50 });
      fetchTours();
    } catch { alert('❌ Failed to create tour.'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel and delete this tour?')) {
      try { await cancelTour(id, user.token); fetchTours(); }
      catch { alert('Failed to cancel tour.'); }
    }
  };

  const handleKick = async () => {
    if (!kickModal.reason.trim()) return alert('Please provide a reason.');
    try {
      await kickTraveler(kickModal.tourId, kickModal.travelerId, kickModal.reason, user.token);
      setKickModal({ isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '' });
      fetchTours();
    } catch { alert('Failed to remove traveler.'); }
  };

  const input = 'w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-yellow-500 transition-all text-sm';

  return (
    <div className="animate-fadeIn">
      <button onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Create Form */}
        <div className="lg:col-span-1 bg-gray-800/60 border border-gray-700 rounded-2xl p-6 h-fit shadow-lg">
          <h3 className="text-lg font-bold text-yellow-400 mb-6 flex items-center gap-2">
            <span className="text-xl">🗓️</span> Host New Tour
          </h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input className={input} type="text" placeholder="Tour Title" required
              value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            <textarea className={`${input} resize-none`} placeholder="Description" required rows="3"
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className={input} type="text" placeholder="Location" required
                value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              <input className={`${input} [color-scheme:dark]`} type="date" required
                value={formData.fixedDate} onChange={(e) => setFormData({ ...formData, fixedDate: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">👥</span>
                <input className={`${input} pl-8`} type="number" placeholder="Max guests" min="2" required
                  value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input className={`${input} pl-7`} type="number" placeholder="Price" min="0" required
                  value={formData.pricePerPerson} onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Publishing…
                </>
              ) : '🚀 Publish Tour'}
            </button>
          </form>
        </div>

        {/* My Tours List */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-l-4 border-yellow-500 pl-3">
            My Hosted Tours ({myTours.length})
          </h3>

          {myTours.length === 0 ? (
            <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-gray-300 font-semibold mb-1">No tours hosted yet</p>
              <p className="text-gray-500 text-sm">Fill out the form to publish your first group tour.</p>
            </div>
          ) : (
            myTours.map((tour) => (
              <div key={tour._id} className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all shadow-md">
                {/* Tour Header */}
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-yellow-400">{tour.title}</h4>
                    <p className="text-gray-400 text-xs mt-0.5">
                      📅 {new Date(tour.fixedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      &nbsp;·&nbsp; 📍 {tour.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      tour.status === 'Full'
                        ? 'bg-red-900/40 text-red-400 border-red-800'
                        : tour.status === 'Completed'
                        ? 'bg-green-900/40 text-green-400 border-green-800'
                        : 'bg-blue-900/40 text-blue-400 border-blue-800'
                    }`}>
                      {tour.status} · {tour.travelers.length}/{tour.maxParticipants}
                    </span>
                    <button onClick={() => handleCancel(tour._id)}
                      className="text-xs text-red-400 hover:text-red-300 underline transition-colors">
                      Cancel Tour
                    </button>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="px-6 py-3 border-b border-gray-700/50">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Capacity</span>
                    <span>{tour.travelers.length} / {tour.maxParticipants} spots filled</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${(tour.travelers.length / tour.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Traveler List */}
                <div className="px-6 py-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    👥 Joined Travelers
                  </p>
                  {tour.travelers.length > 0 ? (
                    <div className="space-y-2">
                      {tour.travelers.map((t) => (
                        <div key={t._id}
                          className="flex justify-between items-center bg-gray-900/60 border border-gray-700 px-4 py-2.5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-cyan-800 flex items-center justify-center text-xs font-bold text-white">
                              {t.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-white font-medium">{t.name}</span>
                          </div>
                          <button
                            onClick={() => setKickModal({ isOpen: true, tourId: tour._id, travelerId: t._id, travelerName: t.name, reason: '' })}
                            className="text-xs bg-red-900/40 border border-red-800/60 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg transition-all">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No travelers have joined yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kick Modal */}
      {kickModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-bold text-red-400 mb-2">Remove Traveler</h3>
            <p className="text-sm text-gray-300 mb-6">
              You are removing <span className="text-white font-bold">{kickModal.travelerName}</span> from this tour. They will not be able to rejoin.
            </p>
            <label className="block text-sm font-bold text-gray-300 mb-2">Reason for removal</label>
            <textarea
              rows="3"
              placeholder="e.g. Unsafe behavior, No-show, Code of conduct violation..."
              value={kickModal.reason}
              onChange={(e) => setKickModal({ ...kickModal, reason: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 resize-none text-sm mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setKickModal({ isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '' })}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleKick}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Guide Dashboard ────────────────────────────────────────────────── */
const GuideDashboard = () => {
  const [user, setUser]           = useState(null);
  const [view, setView]           = useState('menu'); // 'menu' | 'tours'
  const [tourCount, setTourCount] = useState(0);

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem('user'));
    setUser(u);
    if (u?.role === 'Guide') {
      getTours()
        .then((all) => setTourCount(all.filter((t) => t.guide?._id === u._id && t.status !== 'Cancelled').length))
        .catch(() => {});
    }
  }, []);

  if (!user || user.role !== 'Guide') {
    return (
      <div className="text-center py-20 text-red-500 font-bold text-xl">
        🚫 Access Denied
      </div>
    );
  }

  const cards = [
    { emoji: '🗺️', title: 'Discover Places',   description: 'Plan safe routes for your clients',   accent: 'yellow', to: '/discover' },
    { emoji: '⭐', title: 'My Reviews',          description: 'See what travelers say about you',    accent: 'purple', to: '/guide-reviews' },
    { emoji: '🛡️', title: 'Safety Alerts',      description: 'Real-time area safety data',          accent: 'green',  to: '/alerts' },
    { emoji: '📅', title: 'Booking Requests',    description: 'Accept & complete bookings',          accent: 'cyan',   to: '/bookings' },
    { emoji: '✏️', title: 'Edit Profile',        description: 'Update your guide profile',           accent: 'rose',   to: '/edit-profile' },
  ];

  if (view === 'tours') {
    return (
      <div className="container mx-auto px-6 py-10 text-white max-w-5xl">
        <TourManagement user={user} onBack={() => setView('menu')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white max-w-5xl animate-fadeIn">

      {/* ── Header ── */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl font-extrabold text-yellow-400">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, <span className="text-yellow-400">{user.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Guide · {user.email}</p>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Stat label="Account Type"  value="Guide" />
        <Stat label="Active Tours"  value={tourCount > 0 ? tourCount : '—'} />
        <Stat label="Status"        value="Active ✅" />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          {/* Tour Management — opens inline panel */}
          <ActionCard
            onClick={() => setView('tours')}
            emoji="🗓️"
            title="Tour Management"
            description="Create & manage your group tours"
            accent="amber"
          />

          {/* Standard link cards */}
          {cards.map((c) => <Card key={c.to} {...c} />)}
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;