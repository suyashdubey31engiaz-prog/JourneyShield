import React, { useState, useEffect } from 'react';
import reviewService from '../services/reviewService';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} xmlns="http://www.w3.org/2000/svg"
        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
        viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
      </svg>
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  // FIX: reviewModel stores the traveler in the 'user' field (not 'traveler')
  const reviewer = review.user;
  const initials = reviewer?.name ? reviewer.name.substring(0, 2).toUpperCase() : '??';

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 hover:border-yellow-500/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{reviewer?.name || 'Anonymous'}</p>
            <p className="text-gray-500 text-xs">
              {(review.updatedAt || review.createdAt)
                ? new Date(review.updatedAt || review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Date unavailable'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} />
          <span className="text-xs text-gray-500">{review.rating}/5</span>
        </div>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{review.comment || 'No comment provided.'}</p>
    </div>
  );
};

const GuideReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    if (loggedInUser?._id) {
      reviewService.getReviews(loggedInUser._id)
        .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
        .catch(() => setError('Failed to load reviews. Please try again.'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star, count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10 max-w-3xl space-y-4">
        <div className="h-8 skeleton rounded w-48 mb-8" />
        {[1,2,3].map((i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl text-white animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">My Reviews</h1>
        <p className="text-gray-400 text-sm mt-1">Reviews left by travelers after completed bookings.</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500/40 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {reviews.length > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-6">
          <div className="text-center flex flex-col items-center justify-center">
            <p className="text-6xl font-extrabold text-yellow-400 leading-none mb-2">{avgRating}</p>
            <StarRating rating={Math.round(parseFloat(avgRating))} />
            <p className="text-gray-400 text-sm mt-2">Average Rating</p>
            <p className="text-gray-500 text-xs">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-2 self-center">
            {ratingDist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-4 text-right">{star}</span>
                <svg className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
                </svg>
                <div className="flex-grow h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(count / reviews.length) * 100}%` }} />
                </div>
                <span className="text-gray-400 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
        </div>
      ) : !error && (
        <div className="text-center py-20 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <p className="text-5xl mb-4">⭐</p>
          <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Reviews appear here once a traveler marks a booking as completed and submits feedback.
          </p>
        </div>
      )}
    </div>
  );
};

export default GuideReviews;