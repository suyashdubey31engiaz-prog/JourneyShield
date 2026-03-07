import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createBooking } from '../services/bookingService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ---------- Guide Card ---------- */
const GuideCard = ({ guide, onHire }) => {
  const initials = guide.name ? guide.name.substring(0, 2).toUpperCase() : '??';

  return (
    <div className="bg-gray-800/60 rounded-2xl border border-gray-700 overflow-hidden flex flex-col hover:border-yellow-500/40 hover:-translate-y-1 transition-all duration-300 shadow-lg group">
      {/* Card Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700/80 px-6 pt-8 pb-6 text-center border-b border-gray-700">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 border-4 border-gray-700 group-hover:border-yellow-500/40 transition-all shadow-lg">
          {initials}
        </div>
        <h3 className="text-xl font-bold text-white">{guide.name}</h3>
        <p className="text-sm text-yellow-400 font-semibold mt-1">
          📍 {guide.location || 'Location Not Specified'}
        </p>
      </div>

      {/* Card Body */}
      <div className="px-6 py-5 flex-grow">
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
          {guide.bio || 'This guide hasn\'t added a bio yet.'}
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-6 pb-6 flex gap-3">
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
          Reviews
        </button>
        <button
          onClick={() => onHire(guide)}
          className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl transition-all shadow-md shadow-yellow-500/20 text-sm"
        >
          Hire Now
        </button>
      </div>
    </div>
  );
};

/* ---------- Main Component ---------- */
const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [isPrivateGroup, setIsPrivateGroup] = useState(false);
  const [groupMembers, setGroupMembers] = useState([{ name: '', age: '', notes: '' }]);
  const [bookingMessage, setBookingMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(loggedInUser);
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      // FIX: Use env variable instead of hardcoded localhost
      const { data } = await axios.get(`${API_BASE}/api/users/guides`);
      if (Array.isArray(data)) setGuides(data);
      else if (data && Array.isArray(data.guides)) setGuides(data.guides);
      else setGuides([]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load guides. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (guide) => {
    if (!user) return alert('Please login to hire a guide.');
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

  const handleMemberChange = (index, field, value) => {
    const updated = [...groupMembers];
    updated[index][field] = value;
    setGroupMembers(updated);
  };

  const addMember = () => setGroupMembers([...groupMembers, { name: '', age: '', notes: '' }]);

  const removeMember = (index) => setGroupMembers(groupMembers.filter((_, i) => i !== index));

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingMessage('');

    const bookingData = {
      guideId: selectedGuide._id,
      date: bookingDate,
      isPrivateGroup,
      groupMembers: isPrivateGroup ? groupMembers : [],
    };

    try {
      await createBooking(bookingData, user.token);
      setBookingMessage('success');
      setTimeout(() => closeModal(), 2000);
    } catch {
      setBookingMessage('error');
    } finally {
      setSubmitting(false);
    }
  };

  /* LOADING SKELETONS */
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="text-center mb-12">
          <div className="h-10 skeleton rounded-xl w-64 mx-auto mb-4" />
          <div className="h-4 skeleton rounded w-80 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="h-44 skeleton" />
              <div className="p-6 space-y-3">
                <div className="h-4 skeleton rounded w-3/4 mx-auto" />
                <div className="h-4 skeleton rounded w-1/2 mx-auto" />
                <div className="h-10 skeleton rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">

      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-yellow-400 mb-3">Hire a Local Expert</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Connect with verified guides who know the safest routes and hidden gems.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/40 text-red-300 p-6 rounded-2xl text-center max-w-2xl mx-auto mb-8">
          ⚠️ {error}
        </div>
      )}

      {/* Empty State */}
      {!error && guides.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🗺️</p>
          <h3 className="text-xl font-bold text-white mb-2">No Guides Found</h3>
          <p className="text-gray-400 text-sm">
            Ensure you have users registered with the role of "Guide" in the database.
          </p>
        </div>
      )}

      {/* Guide Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {guides.map((guide) => (
          <GuideCard key={guide._id} guide={guide} onHire={openModal} />
        ))}
      </div>

      {/* HIRE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl my-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-cyan-700 flex items-center justify-center text-sm font-bold text-white">
                {selectedGuide?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Hire {selectedGuide?.name}</h3>
                <p className="text-gray-400 text-xs">Send a booking request</p>
              </div>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Date</label>
                <input
                  type="date" required value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none [color-scheme:dark]"
                />
              </div>

              {/* Private Group Toggle */}
              <div
                onClick={() => setIsPrivateGroup((p) => !p)}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isPrivateGroup ? 'border-yellow-500/60 bg-yellow-500/5' : 'border-gray-700 bg-gray-900'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isPrivateGroup ? 'bg-yellow-500 border-yellow-500' : 'border-gray-500'
                }`}>
                  {isPrivateGroup && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Private Group Booking</p>
                  <p className="text-gray-400 text-xs">Add details for each group member</p>
                </div>
              </div>

              {/* Group Members */}
              {isPrivateGroup && (
                <div className="space-y-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                  <h4 className="text-sm font-bold text-yellow-400">Group Members</h4>
                  {groupMembers.map((member, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-xl border border-gray-600 relative">
                      {groupMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Name *</label>
                          <input
                            type="text" required value={member.name}
                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:border-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Age</label>
                          <input
                            type="number" value={member.age}
                            onChange={(e) => handleMemberChange(index, 'age', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:border-yellow-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Notes (Allergies, Mobility, etc.)</label>
                        <input
                          type="text" value={member.notes}
                          onChange={(e) => handleMemberChange(index, 'notes', e.target.value)}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm outline-none focus:border-yellow-500"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMember}
                    className="text-sm text-yellow-500 hover:text-yellow-400 font-bold border border-yellow-500/40 border-dashed px-3 py-2 rounded-xl w-full transition-colors"
                  >
                    + Add Another Member
                  </button>
                </div>
              )}

              {/* Status Messages */}
              {bookingMessage === 'success' && (
                <div className="bg-green-900/40 border border-green-500/40 text-green-400 p-3 rounded-xl text-sm text-center font-bold">
                  ✅ Booking request sent successfully!
                </div>
              )}
              {bookingMessage === 'error' && (
                <div className="bg-red-900/40 border border-red-500/40 text-red-400 p-3 rounded-xl text-sm text-center font-bold">
                  ❌ Failed to send request. Please try again.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || bookingMessage === 'success'}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-all shadow-lg"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guides;