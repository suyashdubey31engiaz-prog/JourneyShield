import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createTour, getTours, kickTraveler, cancelTour } from '../services/tourService';

// --- SVGS EXACTLY MATCHING YOUR DASHBOARD.JSX ---
const DiscoverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SafetyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const ManagementIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;

// Component for standard Links (Discover & Safety)
const FeatureLinkCard = ({ to, icon, title }) => (
  <Link to={to} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center aspect-square hover:border-yellow-400 hover:bg-gray-700/50 transition-colors">
    <div className="w-10 h-10 mb-2 text-yellow-400">{icon}</div>
    <span className="font-semibold text-sm text-gray-200">{title}</span>
  </Link>
);

// Component for Action buttons (Tour Management)
const ActionCard = ({ onClick, icon, title }) => (
  <button onClick={onClick} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700 text-center flex flex-col items-center justify-center aspect-square hover:border-yellow-400 hover:bg-gray-700/50 transition-colors w-full h-full">
    <div className="w-10 h-10 mb-2 text-yellow-400">{icon}</div>
    <span className="font-semibold text-sm text-gray-200">{title}</span>
  </button>
);

const GuideDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('menu'); // Determines if we see the cards or the management UI

  // --- TOUR MANAGEMENT STATE ---
  const [myTours, setMyTours] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', location: '', fixedDate: '', maxParticipants: 10, pricePerPerson: 50 });
  const [loadingTour, setLoadingTour] = useState(false);
  const [kickModal, setKickModal] = useState({ isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '' });

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(loggedInUser);
    if (loggedInUser && loggedInUser.role === 'Guide') {
      fetchMyTours(loggedInUser._id);
    }
  }, []);

  const fetchMyTours = async (guideId) => {
    try {
      const allTours = await getTours();
      setMyTours(allTours.filter(t => t.guide?._id === guideId));
    } catch (error) { console.error("Error fetching my tours", error); }
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    setLoadingTour(true);
    try {
      await createTour(formData, user.token);
      alert('✅ Group Tour successfully created!');
      setFormData({ title: '', description: '', location: '', fixedDate: '', maxParticipants: 10, pricePerPerson: 50 });
      fetchMyTours(user._id);
    } catch (error) { alert('❌ Failed to create tour.'); }
    finally { setLoadingTour(false); }
  };

  const handleCancelTour = async (tourId) => {
    if(window.confirm("Are you sure you want to cancel and delete this tour?")) {
      try {
        await cancelTour(tourId, user.token); 
        fetchMyTours(user._id); 
      } catch(err) { alert("Failed to cancel tour."); }
    }
  };

  const handleConfirmKick = async () => {
    if (!kickModal.reason.trim()) return alert('Please provide a reason.');
    try {
      await kickTraveler(kickModal.tourId, kickModal.travelerId, kickModal.reason, user.token);
      setKickModal({ isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '' });
      fetchMyTours(user._id);
    } catch (error) { alert('Failed to remove traveler.'); }
  };

  if (!user || user.role !== 'Guide') return <div className="text-center py-20 text-red-500 font-bold">Access Denied</div>;

  return (
    <div className="container mx-auto p-6 text-white min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">
          Welcome, <span className="text-yellow-400">{user?.name}</span>
        </h1>
        <p className="text-lg text-gray-400 mt-2">Manage your tours and verify safe routes.</p>
      </div>

      {/* --- DASHBOARD MENU VIEW (Exact UI match to Traveler) --- */}
      {activeView === 'menu' ? (
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fadeIn">
          {/* Action Card changes the view to Tour Management */}
          <ActionCard onClick={() => setActiveView('management')} icon={<ManagementIcon />} title="Tour Management" />
          
          {/* Link Cards use the EXACT same pages the Traveler uses! */}
          <FeatureLinkCard to="/discover" icon={<DiscoverIcon />} title="Discover Places" />
          <FeatureLinkCard to="/alerts" icon={<SafetyIcon />} title="Safety Alerts" />
        </div>
      ) : (
        
        /* --- TOUR MANAGEMENT VIEW --- */
        <div className="max-w-6xl mx-auto animate-fadeIn">
          <button 
            onClick={() => setActiveView('menu')} 
            className="mb-8 flex items-center text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            &larr; Back to Dashboard Menu
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg h-fit">
              <h3 className="text-xl font-bold text-yellow-400 mb-6">Host New Tour</h3>
              <form onSubmit={handleTourSubmit} className="space-y-4">
                <input type="text" placeholder="Tour Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500" />
                <textarea placeholder="Description" required rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500"></textarea>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Location" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500" />
                  <input type="date" required value={formData.fixedDate} onChange={(e) => setFormData({...formData, fixedDate: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white [color-scheme:dark] outline-none focus:border-yellow-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Max Guests" min="2" required value={formData.maxParticipants} onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500" />
                  <input type="number" placeholder="Price ($)" min="0" required value={formData.pricePerPerson} onChange={(e) => setFormData({...formData, pricePerPerson: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500" />
                </div>
                <button type="submit" disabled={loadingTour} className="w-full mt-4 bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg">
                  {loadingTour ? 'Publishing...' : 'Publish Tour'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Active Hosted Tours</h3>
              {myTours.map(tour => (
                <div key={tour._id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-yellow-400">{tour.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">📅 {new Date(tour.fixedDate).toLocaleDateString()} &nbsp;|&nbsp; 📍 {tour.location}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-4 py-1 text-xs font-bold rounded-full border ${tour.status === 'Full' ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-green-900/50 text-green-400 border-green-800'}`}>
                        {tour.status} ({tour.travelers.length}/{tour.maxParticipants})
                      </span>
                      <button onClick={() => handleCancelTour(tour._id)} className="text-xs text-red-400 hover:text-red-300 underline mt-2">Cancel Tour</button>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Joined Travelers</p>
                    {tour.travelers.map(t => (
                      <div key={t._id} className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-lg mb-2 border border-gray-700">
                        <span className="text-sm text-white font-medium">👤 {t.name}</span>
                        <button onClick={() => setKickModal({ isOpen: true, tourId: tour._id, travelerId: t._id, travelerName: t.name, reason: '' })} className="text-xs bg-red-900/50 border border-red-800 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded-md transition-colors">Remove</button>
                      </div>
                    ))}
                    {tour.travelers.length === 0 && <p className="text-sm text-gray-500 italic p-2">No travelers have joined this tour yet.</p>}
                  </div>
                </div>
              ))}
              {myTours.length === 0 && <div className="bg-gray-800 p-10 rounded-2xl border border-gray-700 text-center"><p className="text-gray-400 text-lg">You haven't hosted any tours yet.</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* --- KICK MODAL --- */}
      {kickModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
            <h3 className="text-2xl font-bold text-red-400 mb-3">Remove Traveler</h3>
            <p className="text-sm text-gray-300 mb-6">
              You are permanently removing <span className="text-white font-bold">{kickModal.travelerName}</span> from this tour.
            </p>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Reason for removal:</label>
            <textarea placeholder="e.g., Unsafe behavior..." value={kickModal.reason} onChange={(e) => setKickModal({ ...kickModal, reason: e.target.value })} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white mb-6 outline-none focus:border-red-500 shadow-inner min-h-[100px]"></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setKickModal({ isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '' })} className="px-6 py-3 text-sm font-bold text-gray-300 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={handleConfirmKick} className="px-6 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors shadow-lg">Confirm Removal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDashboard;