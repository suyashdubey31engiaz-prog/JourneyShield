import React, { useState, useEffect } from 'react';
import { getMyBookings, getGuideBookings, updateBookingStatus } from '../services/bookingService';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
      fetchBookings(loggedInUser);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBookings = async (currentUser) => {
    try {
      let data;
      // Fetch different data based on the user's role
      if (currentUser.role === 'Guide') {
        data = await getGuideBookings(currentUser.token);
      } else {
        data = await getMyBookings(currentUser.token);
      }
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status, user.token);
      fetchBookings(user); // Refresh the list after accepting/rejecting
    } catch (error) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="text-white text-center py-20 font-semibold tracking-wide">Loading your journeys...</div>;
  if (!user) return <div className="text-white text-center py-20 font-semibold tracking-wide">Please log in to view your bookings.</div>;

  const isGuide = user.role === 'Guide';

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <h2 className="text-3xl font-bold text-white mb-6">
        {isGuide ? 'Incoming Booking Requests' : 'My Private Bookings'}
      </h2>

      {bookings.length === 0 ? (
        <p className="text-gray-400 bg-gray-800 p-6 rounded-lg text-center border border-gray-700">
          {isGuide 
            ? "You have no incoming booking requests right now." 
            : "You have no upcoming private bookings. Head over to the Guides page to hire someone!"}
        </p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking?._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-yellow-400">
                    {/* Show the Guide's name to the Traveler, and the Traveler's name to the Guide */}
                    {isGuide 
                      ? `Traveler: ${booking?.traveler?.name || 'Unknown'}` 
                      : `Guide: ${booking?.guide?.name || 'Unknown'}`}
                  </h3>
                  <p className="text-gray-300 mt-1 text-sm">
                    📅 Date: {booking?.date ? new Date(booking.date).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <span className={`px-4 py-1 text-xs font-bold rounded-full border ${
                  booking?.status === 'Accepted' ? 'bg-green-900/50 text-green-400 border-green-800' :
                  booking?.status === 'Rejected' ? 'bg-red-900/50 text-red-400 border-red-800' :
                  'bg-yellow-900/50 text-yellow-400 border-yellow-800'
                }`}>
                  {booking?.status || 'Pending'}
                </span>
              </div>

              {/* Show Private Group Members safely */}
              {booking?.isPrivateGroup && booking?.groupMembers?.length > 0 && (
                <div className="mt-4 bg-gray-900 p-4 rounded-md border border-gray-700">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Group Members:</p>
                  <ul className="space-y-2">
                    {booking.groupMembers.map((member, idx) => (
                      <li key={idx} className="flex flex-col bg-gray-800 p-3 rounded border border-gray-700">
                        <span className="text-white font-medium text-sm">
                          👤 {member?.name} {member?.age ? <span className="text-gray-400 text-xs ml-2">(Age: {member.age})</span> : ''}
                        </span>
                        {member?.notes && <span className="text-xs text-gray-400 mt-1 italic pl-5">Note: {member.notes}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guide Action Buttons (Accept/Reject) */}
              {isGuide && booking?.status === 'Pending' && (
                <div className="mt-4 flex gap-3 border-t border-gray-700 pt-4">
                  <button 
                    onClick={() => handleStatusUpdate(booking._id, 'Accepted')}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
                  >
                    Accept Request
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(booking._id, 'Rejected')}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;