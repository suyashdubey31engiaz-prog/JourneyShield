import React, { useState, useEffect } from 'react';
import { getTours, joinTour } from '../services/tourService';

const GroupTours = () => {
  const [tours, setTours] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(loggedInUser);
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const data = await getTours();
      setTours(data);
    } catch (error) {
      console.error("Error fetching tours", error);
    }
  };

  const handleJoin = async (tourId) => {
    if (!user) {
      return alert("Please login to join a tour.");
    }
    try {
      await joinTour(tourId, user.token);
      alert("Successfully joined the group!");
      fetchTours(); // Refresh the list to update the spots available
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join tour");
    }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-white mb-6">Upcoming Group Tours</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <div key={tour._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">{tour.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{tour.description}</p>
            
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <p>📍 Location: <span className="text-white">{tour.location}</span></p>
              <p>📅 Date: <span className="text-white">{new Date(tour.fixedDate).toLocaleDateString()}</span></p>
              <p>👤 Guide: <span className="text-white">{tour.guide?.name}</span></p>
              <p>💰 Price: <span className="text-white">${tour.pricePerPerson}</span></p>
            </div>

            {/* Travelers already in the group */}
            <div className="mb-4 p-3 bg-gray-900 rounded-md">
              <p className="text-sm font-semibold text-gray-300 mb-2">
                Travelers Joined ({tour.travelers.length}/{tour.maxParticipants}):
              </p>
              <div className="flex flex-wrap gap-2">
                {tour.travelers.map((t) => (
                  <span key={t._id} className="px-2 py-1 bg-gray-700 text-xs rounded-full text-white">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>

            {/* NEW LOGIC: Check if user is a Guide vs Traveler */}
            {user?.role === 'Guide' ? (
              <button 
                disabled 
                className="w-full py-2 rounded-md font-bold transition-all bg-gray-600 text-gray-400 cursor-not-allowed"
              >
                {tour.guide?._id === user?._id ? 'Your Hosted Tour' : 'Guides Cannot Join'}
              </button>
            ) : (
              <button 
                onClick={() => handleJoin(tour._id)}
                disabled={tour.travelers.some(t => t._id === user?._id) || tour.travelers.length >= tour.maxParticipants}
                className={`w-full py-2 rounded-md font-bold transition-all ${
                  tour.travelers.some(t => t._id === user?._id)
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : tour.travelers.length >= tour.maxParticipants 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-500 text-black hover:bg-yellow-400'
                }`}
              >
                {tour.travelers.some(t => t._id === user?._id) 
                  ? 'Already Joined' 
                  : tour.travelers.length >= tour.maxParticipants 
                  ? 'Tour Full' 
                  : 'Join Group'}
              </button>
            )}
          </div>
        ))}
        {tours.length === 0 && <p className="text-gray-400">No group tours available right now.</p>}
      </div>
    </div>
  );
};

export default GroupTours;