import React, { useState, useEffect } from 'react';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';

// Review Modal Component
const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reviewService.createReview({
        guideId: booking.guide._id,
        bookingId: booking._id,
        rating,
        comment
      });
      alert('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-yellow-500 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Rate {booking.guide.user.name}</h3>
        <p className="text-gray-400 text-sm mb-4">
          Share your experience from your trip on {new Date(booking.date).toLocaleDateString()}.
          <br/>
          <span className="text-xs text-yellow-500/80">*Updating this will overwrite your previous review for this guide.</span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Rating</label>
            <select value={rating} onChange={e => setRating(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-white p-2 rounded focus:border-yellow-500 focus:outline-none">
              <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
              <option value="4">⭐⭐⭐⭐ (Good)</option>
              <option value="3">⭐⭐⭐ (Average)</option>
              <option value="2">⭐⭐ (Poor)</option>
              <option value="1">⭐ (Terrible)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">Comment</label>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded h-24 focus:border-yellow-500 focus:outline-none"
              placeholder="Tell us about the safety, knowledge, and experience..."
              required
            ></textarea>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 py-2 rounded text-gray-300 hover:bg-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-yellow-500 py-2 rounded text-gray-900 font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [user] = useState(JSON.parse(sessionStorage.getItem('user')));
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = () => {
    bookingService.getMyBookings()
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchBookings();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const isGuide = user?.role === 'Guide';

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8 border-b border-gray-800 pb-4">
        {isGuide ? 'Incoming Requests' : 'My Trips'}
      </h1>
      
      <div className="grid gap-4 max-w-4xl mx-auto">
        {bookings.length === 0 && (
          <div className="text-center py-10 bg-gray-800/30 rounded-lg">
            <p className="text-gray-500 text-lg">No bookings found.</p>
          </div>
        )}
        
        {bookings.map(booking => (
          <div key={booking._id} className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-600 transition-all">
            <div>
              <h3 className="text-xl text-white font-semibold flex items-center gap-2">
                {isGuide ? (
                  <>👤 <span className="text-gray-300">Traveler:</span> {booking.traveler.name}</>
                ) : (
                  <>🗺️ <span className="text-gray-300">Guide:</span> {booking.guide.user.name}</>
                )}
              </h3>
              <div className="text-gray-400 mt-2 space-y-1 text-sm">
                <p>📅 Date: <span className="text-gray-200">{new Date(booking.date).toLocaleDateString()}</span></p>
                <p>📝 Notes: <span className="italic">{booking.notes || 'None'}</span></p>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  booking.status === 'Completed' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                  booking.status === 'Confirmed' ? 'bg-blue-900/50 text-blue-400 border border-blue-700' :
                  booking.status === 'Rejected' ? 'bg-red-900/50 text-red-400 border border-red-700' :
                  'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                }`}>
                  {booking.status}
                </span>
                {/* Visual indicator if reviewed */}
                {booking.isReviewed && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-400 border border-purple-700">
                    ⭐ Reviewed
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              {/* GUIDE ACTIONS */}
              {isGuide && booking.status === 'Pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange(booking._id, 'Confirmed')} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors font-medium">Accept</button>
                  <button onClick={() => handleStatusChange(booking._id, 'Rejected')} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors font-medium">Reject</button>
                </div>
              )}
              
              {isGuide && booking.status === 'Confirmed' && (
                <button onClick={() => handleStatusChange(booking._id, 'Completed')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-lg shadow-blue-900/20">
                  Mark Trip Completed
                </button>
              )}

              {/* TRAVELER ACTIONS */}
              {!isGuide && booking.status === 'Completed' && (
                <button 
                  onClick={() => setReviewBooking(booking)} 
                  disabled={booking.isReviewed} // Disable if already reviewed
                  className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
                    booking.isReviewed 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-yellow-900/20'
                  }`}
                >
                  {booking.isReviewed ? 'Review Submitted' : 'Rate Guide'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviewBooking && (
        <ReviewModal 
          booking={reviewBooking} 
          onClose={() => setReviewBooking(null)} 
          onSuccess={() => {
            setReviewBooking(null);
            fetchBookings();
          }} 
        />
      )}
    </div>
  );
};

export default MyBookings;