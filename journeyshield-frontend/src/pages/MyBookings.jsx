import React, { useState, useEffect } from 'react';
import { getMyBookings, getGuideBookings, updateBookingStatus } from '../services/bookingService';
import reviewService from '../services/reviewService';

/* ─────────────────────── Star Picker ─────────────────────── */
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-8 h-8 ${star <= value ? 'text-yellow-400' : 'text-gray-600'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      </button>
    ))}
  </div>
);

/* ─────────────────────── Review Modal ─────────────────────── */
const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return setError('Please write a comment before submitting.');
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ guideId: booking.guide._id, rating, comment, bookingId: booking._id });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl animate-fadeIn">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-700 flex items-center justify-center text-sm font-bold text-white">
            {booking.guide?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Rate Your Experience</h3>
            <p className="text-gray-400 text-xs">With {booking.guide?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-5 text-center">
            <p className="text-gray-300 text-sm font-medium mb-4">How was your experience?</p>
            <div className="flex justify-center mb-3">
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <p className={`text-sm font-bold transition-all ${
              rating >= 5 ? 'text-green-400' : rating >= 4 ? 'text-yellow-400' : rating >= 3 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {ratingLabels[rating]}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Your Review <span className="text-red-400">*</span>
            </label>
            <textarea
              rows="4"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other travelers about your experience. Was the guide knowledgeable? Did they keep you safe? Was it value for money?"
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{comment.length} characters</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/40 border border-red-500/40 text-red-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-all shadow-md"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting...
                </span>
              ) : '⭐ Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────── Status Badge ─────────────────────── */
const StatusBadge = ({ status }) => {
  const styles = {
    Pending:   'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    Accepted:  'bg-blue-900/40 text-blue-400 border-blue-800',
    Completed: 'bg-green-900/40 text-green-400 border-green-800',
    Rejected:  'bg-red-900/40 text-red-400 border-red-800',
  };
  const icons = { Pending: '⏳', Accepted: '✅', Completed: '🏁', Rejected: '❌' };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || styles.Pending}`}>
      {icons[status]} {status}
    </span>
  );
};

/* ─────────────────────── Booking Card ─────────────────────── */
const BookingCard = ({ booking, isGuide, onStatusUpdate, onLeaveReview }) => {
  const canMarkComplete = isGuide && booking.status === 'Accepted';
  const canReview = !isGuide && booking.status === 'Completed' && !booking.isReviewed;
  const alreadyReviewed = !isGuide && booking.status === 'Completed' && booking.isReviewed;

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all shadow-md">

      {/* Card Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-yellow-400">
            {isGuide
              ? `${booking?.traveler?.name || 'Unknown Traveler'}`
              : `Guide: ${booking?.guide?.name || 'Unknown'}`}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            📅 {booking?.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date TBD'}
          </p>
        </div>
        <StatusBadge status={booking?.status || 'Pending'} />
      </div>

      {/* Card Body */}
      <div className="px-6 py-4">
        {/* Private Group Members */}
        {booking?.isPrivateGroup && booking?.groupMembers?.length > 0 && (
          <div className="mb-4 bg-gray-900/60 border border-gray-700 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              👥 Group Members ({booking.groupMembers.length})
            </p>
            <div className="space-y-2">
              {booking.groupMembers.map((member, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-cyan-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    {member?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-white font-medium text-sm">{member?.name}</span>
                    {member?.age && <span className="text-gray-400 text-xs ml-2">(Age {member.age})</span>}
                    {member?.notes && <p className="text-xs text-gray-400 italic mt-0.5">📝 {member.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Already reviewed badge */}
        {alreadyReviewed && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            You've already reviewed this trip. Thank you!
          </div>
        )}
      </div>

      {/* Card Footer — Actions */}
      {(isGuide || canReview) && (
        <div className="px-6 pb-5 flex gap-3">
          {/* GUIDE ACTIONS */}
          {isGuide && booking?.status === 'Pending' && (
            <>
              <button
                onClick={() => onStatusUpdate(booking._id, 'Accepted')}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
              >
                ✅ Accept
              </button>
              <button
                onClick={() => onStatusUpdate(booking._id, 'Rejected')}
                className="flex-1 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
              >
                ❌ Reject
              </button>
            </>
          )}

          {/* GUIDE: Mark as Completed (only when Accepted) */}
          {canMarkComplete && (
            <button
              onClick={() => {
                if (window.confirm(`Mark this booking with ${booking?.traveler?.name} as Completed? This will allow them to leave a review.`)) {
                  onStatusUpdate(booking._id, 'Completed');
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark as Completed
            </button>
          )}

          {/* TRAVELER: Leave Review (only when Completed and not yet reviewed) */}
          {canReview && (
            <button
              onClick={() => onLeaveReview(booking)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-yellow-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
              </svg>
              Leave a Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────── Main Page ─────────────────────── */
const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // holds the booking being reviewed
  const [successToast, setSuccessToast] = useState('');

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
      const data = currentUser.role === 'Guide'
        ? await getGuideBookings(currentUser.token)
        : await getMyBookings(currentUser.token);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status, user.token);
      showToast(`Booking marked as ${status}`);
      fetchBookings(user);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    await reviewService.createReview(reviewData);
    showToast('Review submitted successfully! ⭐');
    fetchBookings(user);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10 max-w-3xl">
        <div className="h-8 skeleton rounded w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-4xl mb-4">🔒</p>
        <p className="text-xl font-semibold">Please log in to view your bookings.</p>
      </div>
    );
  }

  const isGuide = user.role === 'Guide';

  // Separate bookings by status for better UX
  const activeBookings = bookings.filter(b => ['Pending', 'Accepted'].includes(b.status));
  const pastBookings   = bookings.filter(b => ['Completed', 'Rejected'].includes(b.status));

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl text-white">

      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white font-bold px-6 py-3 rounded-xl shadow-2xl animate-fadeIn">
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">
          {isGuide ? 'Booking Requests' : 'My Bookings'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {isGuide
            ? 'Manage incoming requests and mark trips as completed to enable traveler reviews.'
            : 'Track your guide bookings. Once a trip is completed, you can leave a review.'}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <p className="text-5xl mb-4">{isGuide ? '📬' : '🗺️'}</p>
          <h3 className="text-xl font-bold text-white mb-2">
            {isGuide ? 'No Booking Requests Yet' : 'No Bookings Yet'}
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            {isGuide
              ? 'Travelers will appear here when they hire you. Make sure your profile is up to date!'
              : 'Head over to the Guides page to hire a local expert for your next adventure.'}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-l-4 border-yellow-500 pl-3">
                Active ({activeBookings.length})
              </h3>
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    isGuide={isGuide}
                    onStatusUpdate={handleStatusUpdate}
                    onLeaveReview={(b) => setReviewModal(b)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-l-4 border-gray-600 pl-3">
                Past ({pastBookings.length})
              </h3>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    isGuide={isGuide}
                    onStatusUpdate={handleStatusUpdate}
                    onLeaveReview={(b) => setReviewModal(b)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          booking={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default MyBookings;