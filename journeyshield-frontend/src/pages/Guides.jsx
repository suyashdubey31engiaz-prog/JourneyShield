import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createBooking } from '../services/bookingService';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // NEW: Error tracking
  const [user, setUser] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [isPrivateGroup, setIsPrivateGroup] = useState(false);
  const [groupMembers, setGroupMembers] = useState([{ name: '', age: '', notes: '' }]);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(loggedInUser);
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      // Trying to fetch from the backend
      const { data } = await axios.get('http://localhost:5000/api/users/guides');
      
      // Safety check to ensure data is an array before setting it
      if (Array.isArray(data)) {
        setGuides(data);
      } else if (data && Array.isArray(data.guides)) {
        setGuides(data.guides);
      } else {
        setGuides([]);
      }
    } catch (err) {
      console.error("Error fetching guides", err);
      // NEW: Set the error so we can see it on the screen
      setError(err.response?.data?.message || err.message || "Failed to load guides. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL CONTROLS ---
  const openModal = (guide) => {
    if (!user) {
      alert("Please login to hire a guide.");
      return;
    }
    setSelectedGuide(guide);
    setIsModalOpen(true);
    setBookingMessage('');
    setBookingDate('');
    setIsPrivateGroup(false);
    setGroupMembers([{ name: '', age: '', notes: '' }]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuide(null);
  };

  // --- DYNAMIC FORM LOGIC ---
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...groupMembers];
    updatedMembers[index][field] = value;
    setGroupMembers(updatedMembers);
  };

  const addMember = () => {
    setGroupMembers([...groupMembers, { name: '', age: '', notes: '' }]);
  };

  const removeMember = (index) => {
    const updatedMembers = groupMembers.filter((_, i) => i !== index);
    setGroupMembers(updatedMembers);
  };

  // --- SUBMIT BOOKING ---
  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage('Submitting request...');

    const bookingData = {
      guideId: selectedGuide._id,
      date: bookingDate,
      isPrivateGroup,
      groupMembers: isPrivateGroup ? groupMembers : []
    };

    try {
      await createBooking(bookingData, user.token);
      setBookingMessage('✅ Booking request sent successfully!');
      setTimeout(() => closeModal(), 2000);
    } catch (err) {
      setBookingMessage('❌ Failed to send request. Try again.');
    }
  };

  if (loading) return <div className="text-white text-center py-20 font-bold text-xl">Loading Local Experts...</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-yellow-500 mb-4">Hire a Local Expert</h2>
        <p className="text-gray-400">Connect with verified guides who know the safest routes and hidden gems.</p>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 p-6 rounded-lg text-center max-w-2xl mx-auto mb-8 font-semibold">
          Error: {error}
        </div>
      )}

      {/* EMPTY STATE DISPLAY */}
      {!error && guides.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 text-gray-400 p-6 rounded-lg text-center max-w-2xl mx-auto mb-8">
          No guides found in the database. Ensure you have users registered with the role of "Guide".
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {guides.map((guide) => (
          <div key={guide._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center flex flex-col items-center shadow-lg">
            {/* Guide Avatar */}
            <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 border-4 border-gray-700">
              {guide.name ? guide.name.substring(0, 2).toUpperCase() : '??'}
            </div>
            
            <h3 className="text-xl font-bold text-white">{guide.name}</h3>
            <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-2">
              {guide.location || 'Location Not Specified'}
            </p>
            
            <p className="text-sm text-gray-400 mb-4 px-4 line-clamp-2 h-10">
              {guide.bio || 'No bio provided yet.'}
            </p>

            <div className="flex w-full gap-3 mt-auto">
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-md transition-colors">
                Read Reviews
              </button>
              <button 
                onClick={() => openModal(guide)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-md transition-colors shadow-md"
              >
                Hire Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- HIRE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-2xl font-bold text-white mb-2">Hire {selectedGuide?.name}</h3>
            <p className="text-gray-400 text-sm mb-6">Fill out the details below to send a booking request.</p>

            <form onSubmit={handleHireSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Date</label>
                <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:border-yellow-500 outline-none [color-scheme:dark]" />
              </div>

              <div className="flex items-center gap-3 bg-gray-900 p-4 rounded-md border border-gray-700">
                <input type="checkbox" id="groupToggle" checked={isPrivateGroup} onChange={(e) => setIsPrivateGroup(e.target.checked)} className="w-5 h-5 accent-yellow-500 cursor-pointer" />
                <label htmlFor="groupToggle" className="text-white font-medium cursor-pointer">This is a Private Group Booking</label>
              </div>

              {isPrivateGroup && (
                <div className="space-y-4 bg-gray-900/50 p-4 rounded-md border border-gray-700">
                  <h4 className="text-sm font-bold text-yellow-400">Add Group Members</h4>
                  {groupMembers.map((member, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded border border-gray-600 relative">
                      {groupMembers.length > 1 && (
                        <button type="button" onClick={() => removeMember(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs font-bold">✕ Remove</button>
                      )}
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Name *</label>
                          <input type="text" required value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Age</label>
                          <input type="number" value={member.age} onChange={(e) => handleMemberChange(index, 'age', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Notes (Allergies, Mobility, etc.)</label>
                        <input type="text" value={member.notes} onChange={(e) => handleMemberChange(index, 'notes', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addMember} className="text-sm text-yellow-500 hover:text-yellow-400 font-bold border border-yellow-500/50 px-3 py-1 rounded w-full border-dashed">
                    + Add Another Member
                  </button>
                </div>
              )}

              {bookingMessage && (
                <div className={`text-sm font-bold text-center ${bookingMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {bookingMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-md transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-md transition-colors shadow-lg">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guides;