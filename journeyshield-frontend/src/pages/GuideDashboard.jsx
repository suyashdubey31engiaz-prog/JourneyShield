import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createTour, getTours, kickTraveler, cancelTour } from '../services/tourService';
import SimpleMap from '../components/common/SimpleMap';
import SafetyModal from '../components/common/SafetyModal';

const GuideDashboard = () => {
  const [user, setUser] = useState(null);
  
  // --- UI STATE (Matching Traveler Dashboard Cards) ---
  const [activeView, setActiveView] = useState('management'); 

  // --- TOUR MANAGEMENT STATE ---
  const [myTours, setMyTours] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', location: '', fixedDate: '', maxParticipants: 10, pricePerPerson: 50 });
  const [loadingTour, setLoadingTour] = useState(false);
  const [kickModal, setKickModal] = useState({ isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '' });

  // --- DISCOVER & SAFETY STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(loggedInUser);
    if (loggedInUser && loggedInUser.role === 'Guide') {
      fetchMyTours(loggedInUser._id);
    }
  }, []);

  // ==========================================
  //        TOUR MANAGEMENT LOGIC
  // ==========================================
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

  // ==========================================
  //        DISCOVER & SAFETY LOGIC
  // ==========================================
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoadingSearch(true);
    try {
      // Fetch Places
      const placesRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/search/places`, {
        params: { query: searchQuery, location: searchQuery }, // Passing searchQuery to location fixes Foursquare
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPlaces(placesRes.data.results || []);

      // Fetch Weather
      const weatherRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/weather/${searchQuery}`);
      setWeather(weatherRes.data);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  if (!user || user.role !== 'Guide') return <div className="text-center py-20 text-red-500 font-bold">Access Denied</div>;

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-white mb-2">Guide Dashboard</h2>
        <p className="text-gray-400">Manage your tours, discover safe routes, and monitor alerts.</p>
      </div>

      {/* --- DASHBOARD OPTIONS (CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div onClick={() => setActiveView('management')} className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${activeView === 'management' ? 'bg-gray-800 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}>
          <h3 className={`text-xl font-bold mb-2 ${activeView === 'management' ? 'text-yellow-400' : 'text-white'}`}>Tour Management</h3>
          <p className="text-sm text-gray-400">Create, edit, and monitor the travelers in your hosted group tours.</p>
        </div>
        <div onClick={() => setActiveView('discover')} className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${activeView === 'discover' ? 'bg-gray-800 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}>
          <h3 className={`text-xl font-bold mb-2 ${activeView === 'discover' ? 'text-yellow-400' : 'text-white'}`}>Discover Places</h3>
          <p className="text-sm text-gray-400">Search for landmarks, restaurants, and hidden gems to add to your routes.</p>
        </div>
        <div onClick={() => setActiveView('safety')} className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${activeView === 'safety' ? 'bg-gray-800 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}>
          <h3 className={`text-xl font-bold mb-2 ${activeView === 'safety' ? 'text-yellow-400' : 'text-white'}`}>Safety Alerts</h3>
          <p className="text-sm text-gray-400">Check live weather, emergency contacts, and area safety indexes.</p>
        </div>
      </div>

      <div className="animate-fadeIn">
        {/* ========================================= */}
        {/* VIEW 1: TOUR MANAGEMENT                   */}
        {/* ========================================= */}
        {activeView === 'management' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit shadow-lg">
              <h3 className="text-xl font-semibold text-yellow-400 mb-6">Host New Tour</h3>
              <form onSubmit={handleTourSubmit} className="space-y-4">
                <input type="text" placeholder="Tour Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-yellow-500" />
                <textarea placeholder="Description" required rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-yellow-500"></textarea>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Location" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-yellow-500" />
                  <input type="date" required value={formData.fixedDate} onChange={(e) => setFormData({...formData, fixedDate: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white [color-scheme:dark] outline-none focus:border-yellow-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Max Guests" min="2" required value={formData.maxParticipants} onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-yellow-500" />
                  <input type="number" placeholder="Price ($)" min="0" required value={formData.pricePerPerson} onChange={(e) => setFormData({...formData, pricePerPerson: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-yellow-500" />
                </div>
                <button type="submit" disabled={loadingTour} className="w-full mt-4 bg-yellow-500 text-black font-bold py-3 rounded hover:bg-yellow-400 transition-colors">
                  {loadingTour ? 'Publishing...' : 'Publish Tour'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-semibold text-white">Active Hosted Tours</h3>
              {myTours.map(tour => (
                <div key={tour._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-yellow-400">{tour.title}</h4>
                      <p className="text-sm text-gray-400">📅 {new Date(tour.fixedDate).toLocaleDateString()} | 📍 {tour.location}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${tour.status === 'Full' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                        {tour.status} ({tour.travelers.length}/{tour.maxParticipants})
                      </span>
                      <button onClick={() => handleCancelTour(tour._id)} className="text-xs text-red-400 hover:text-red-300 underline">Cancel Tour</button>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-md p-4">
                    <p className="text-xs text-gray-400 mb-2">Joined Travelers:</p>
                    {tour.travelers.map(t => (
                      <div key={t._id} className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded mb-2 border border-gray-700">
                        <span className="text-sm text-white">{t.name}</span>
                        <button onClick={() => setKickModal({ isOpen: true, tourId: tour._id, travelerId: t._id, travelerName: t.name, reason: '' })} className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-2 py-1 rounded transition-colors">Remove</button>
                      </div>
                    ))}
                    {tour.travelers.length === 0 && <p className="text-xs text-gray-500 italic">No travelers yet.</p>}
                  </div>
                </div>
              ))}
              {myTours.length === 0 && <p className="text-gray-400 bg-gray-800 p-6 rounded border border-gray-700 text-center">You haven't hosted any tours yet.</p>}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 2 & 3: DISCOVER AND SAFETY           */}
        {/* ========================================= */}
        {(activeView === 'discover' || activeView === 'safety') && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Search & Verify Safety</h3>
              <form onSubmit={handleSearch} className="flex gap-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for a city, landmark, or region..." className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                <button type="submit" disabled={loadingSearch} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-lg transition-colors">
                  {loadingSearch ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {weather && activeView === 'safety' && (
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg flex justify-between items-center">
                <div><h3 className="text-3xl font-bold text-white">{weather.name}, {weather.sys?.country}</h3><p className="text-gray-400 capitalize">{weather.weather[0].description}</p></div>
                <div className="text-center"><p className="text-5xl font-bold text-yellow-500">{Math.round(weather.main.temp)}°C</p></div>
              </div>
            )}

            {places.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-[500px] rounded-xl overflow-hidden border border-gray-700 shadow-lg"><SimpleMap places={places} /></div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {places.map((place) => (
                    <div key={place.fsq_id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{place.name}</h3>
                        <p className="text-sm text-gray-400">{place.location?.formatted_address}</p>
                      </div>
                      <button onClick={() => { setSelectedPlace(place); setIsSafetyModalOpen(true); }} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-bold py-2 px-3 rounded text-sm transition-colors">
                        Check Safety
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- KICK MODAL --- */}
      {kickModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm border border-gray-700">
            <h3 className="text-lg font-bold text-red-400 mb-2">Remove {kickModal.travelerName}</h3>
            <textarea placeholder="Reason required..." value={kickModal.reason} onChange={(e) => setKickModal({ ...kickModal, reason: e.target.value })} className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white mb-4 outline-none focus:border-red-500"></textarea>
            <div className="flex justify-end gap-2">
              <button onClick={() => setKickModal({ isOpen: false, tourId: null, travelerId: null, travelerName: '', reason: '' })} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
              <button onClick={handleConfirmKick} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-500">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SAFETY MODAL --- */}
      <SafetyModal isOpen={isSafetyModalOpen} onClose={() => setIsSafetyModalOpen(false)} place={selectedPlace} />
    </div>
  );
};

export default GuideDashboard;