import React, { useState, useEffect } from 'react';
import { getTours, joinTour } from '../services/tourService';

const TourCard = ({ tour, user, onJoin }) => {
  const spotsLeft = tour.maxParticipants - tour.travelers.length;
  const isFull = spotsLeft <= 0;
  const isJoined = tour.travelers.some((t) => t._id === user?._id);
  const isMyTour = tour.guide?._id === user?._id;
  const isGuide = user?.role === 'Guide';
  const fillPercent = Math.round((tour.travelers.length / tour.maxParticipants) * 100);

  return (
    <div className="bg-gray-800/60 rounded-2xl border border-gray-700 overflow-hidden flex flex-col hover:border-yellow-500/40 transition-all hover:-translate-y-0.5 shadow-lg">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-5 border-b border-gray-700">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-bold text-yellow-400 leading-snug">{tour.title}</h3>
          <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${
            isFull
              ? 'bg-red-900/40 text-red-400 border-red-800'
              : 'bg-green-900/40 text-green-400 border-green-800'
          }`}>
            {isFull ? 'Full' : `${spotsLeft} left`}
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{tour.description}</p>
      </div>

      {/* Card Body */}
      <div className="px-6 py-5 flex-grow space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-900/60 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-0.5">📍 Location</p>
            <p className="text-white font-medium truncate">{tour.location}</p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-0.5">📅 Date</p>
            <p className="text-white font-medium">{new Date(tour.fixedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-0.5">🗺️ Guide</p>
            <p className="text-white font-medium truncate">{tour.guide?.name || 'N/A'}</p>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-0.5">💰 Price</p>
            <p className="text-white font-medium">${tour.pricePerPerson} / person</p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Travelers Joined</span>
            <span className="font-bold text-white">{tour.travelers.length} / {tour.maxParticipants}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Traveler Avatars */}
        {tour.travelers.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {tour.travelers.slice(0, 5).map((t) => (
                <div key={t._id} className="w-7 h-7 rounded-full bg-cyan-700 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white" title={t.name}>
                  {t.name?.charAt(0).toUpperCase()}
                </div>
              ))}
              {tour.travelers.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-300">
                  +{tour.travelers.length - 5}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">{tour.travelers.length} joined</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-6 pb-6">
        {isGuide ? (
          <button disabled className="w-full py-3 rounded-xl font-bold text-sm bg-gray-700 text-gray-400 cursor-not-allowed">
            {isMyTour ? '⭐ Your Hosted Tour' : 'Guides Cannot Join'}
          </button>
        ) : (
          <button
            onClick={() => onJoin(tour._id)}
            disabled={isJoined || isFull}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              isJoined
                ? 'bg-green-700/50 text-green-300 cursor-not-allowed border border-green-700'
                : isFull
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md shadow-yellow-500/20 hover:-translate-y-0.5'
            }`}
          >
            {isJoined ? '✓ Already Joined' : isFull ? 'Tour Full' : 'Join Group'}
          </button>
        )}
      </div>
    </div>
  );
};

const GroupTours = () => {
  const [tours, setTours] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(loggedInUser);
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const data = await getTours();
      setTours(data);
    } catch (error) {
      console.error('Error fetching tours', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (tourId) => {
    if (!user) return alert('Please login to join a tour.');
    try {
      await joinTour(tourId, user.token);
      fetchTours();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join tour');
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white mb-3">Upcoming Group Tours</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Join a guided group tour to explore safely with fellow travelers and expert local guides.
        </p>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="h-32 skeleton" />
              <div className="p-6 space-y-3">
                <div className="h-4 skeleton rounded" />
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-10 skeleton rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tours Grid */}
      {!loading && tours.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour._id} tour={tour} user={user} onJoin={handleJoin} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tours.length === 0 && (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🗺️</p>
          <h3 className="text-xl font-bold text-white mb-2">No Group Tours Available</h3>
          <p className="text-gray-400">Check back soon, or register as a Guide to host your own tour.</p>
        </div>
      )}
    </div>
  );
};

export default GroupTours;