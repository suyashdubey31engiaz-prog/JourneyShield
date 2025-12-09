import React, { useState, useEffect } from 'react';
import guidesService from '../services/guidesService';
import reviewService from '../services/reviewService';

const GuideReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ rating: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. First, get the logged-in Guide's ID
    guidesService.getMyProfile()
      .then(profileRes => {
        const guideId = profileRes.data._id;
        setStats({ 
          rating: profileRes.data.rating, 
          count: profileRes.data.reviews 
        });

        // 2. Then, fetch reviews using that ID
        return reviewService.getReviews(guideId);
      })
      .then(reviewsRes => {
        setReviews(reviewsRes.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-6 text-white min-h-screen">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2 text-center">Your Reputation</h1>
        
        {!loading && (
          <div className="text-center mb-8 bg-gray-800/50 p-4 rounded-lg border border-gray-700 max-w-md mx-auto">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Overall Rating</p>
            <div className="text-5xl font-bold text-white my-2">{stats.rating} <span className="text-2xl text-yellow-500">★</span></div>
            <p className="text-gray-400 text-sm">Based on {stats.count} reviews</p>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? <p className="text-center text-gray-500">Loading reviews...</p> : 
           reviews.length === 0 ? <p className="text-center text-gray-500">No reviews yet. Keep doing great trips!</p> :
           reviews.map(review => (
            <div key={review._id} className="bg-gray-800/40 p-6 rounded-lg border border-gray-700 hover:border-gray-500 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-lg text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                  <span className="text-gray-600 text-sm ml-2">({review.rating}/5)</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-200 italic text-lg">"{review.comment}"</p>
              <p className="text-sm text-gray-500 mt-4 text-right border-t border-gray-700 pt-2">
                - {review.user?.name || "Traveler"}
              </p>
            </div>
          ))}
        </div>
    </div>
  );
};

export default GuideReviews;