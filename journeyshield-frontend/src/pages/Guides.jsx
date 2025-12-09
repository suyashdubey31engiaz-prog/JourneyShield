import React, { useState, useEffect } from 'react';
import guidesService from '../services/guidesService';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';

// --- COMPONENT 1: Booking Modal ---
const BookingModal = ({ guide, onClose }) => {
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingService.createBooking({
        guideId: guide._id,
        date: date,
        notes: notes
      });
      alert(`Request sent to ${guide.user.name}! Check 'My Bookings' for updates.`);
      onClose();
    } catch (error) {
      alert('Failed to book guide: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 p-6 rounded-xl border border-yellow-500/30 w-full max-w-sm shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Hire <span className="text-yellow-400">{guide.user.name}</span></h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Date</label>
            <input 
              type="date" 
              required 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Trip Notes</label>
            <textarea 
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Visiting Taj Mahal, need English speaker..."
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            ></textarea>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-50">
              {loading ? 'Sending...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT 2: Reviews List Modal ---
const ReviewsListModal = ({ guide, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.getReviews(guide._id)
      .then(res => setReviews(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [guide]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-lg border border-gray-700 max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
          <h3 className="text-xl font-bold text-yellow-400">Reviews: {guide.user.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        
        <div className="overflow-y-auto pr-2 space-y-3">
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to hire them!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-200 text-sm">{review.user.name}</span>
                  <span className="text-yellow-400 text-sm">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-gray-300 text-sm italic">"{review.comment}"</p>
                <p className="text-xs text-gray-600 mt-2 text-right">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 3: Guide Card ---
const GuideCard = ({ guide, onHireClick, onViewReviews }) => (
  <div className="bg-gray-800/40 p-5 rounded-xl border border-gray-700 flex flex-col text-center hover:border-gray-500 transition-all hover:bg-gray-800/60 group">
    <div className="relative w-24 h-24 mx-auto mb-4">
      <img 
        src={`https://api.dicebear.com/9.x/initials/svg?seed=${guide.user.name}`} 
        alt={guide.user.name} 
        className="w-full h-full rounded-full border-2 border-yellow-400 object-cover shadow-lg" 
      />
    </div>
    
    <h3 className="font-bold text-xl text-gray-100 mb-1">{guide.user.name}</h3>
    <p className="text-xs text-yellow-500 font-medium mb-3 uppercase tracking-wide">{guide.location}</p>
    
    <div 
      className="flex items-center justify-center gap-2 mb-4 text-sm cursor-pointer hover:bg-gray-700 rounded-full py-1 px-3 transition-colors mx-auto w-fit"
      onClick={() => onViewReviews(guide)}
    >
      <span className="text-yellow-400">⭐ {guide.rating || 'New'}</span>
      <span className="text-gray-400 underline decoration-gray-600">({guide.reviews || 0} reviews)</span>
    </div>

    <p className="text-sm text-gray-400 flex-grow mb-6 px-2 line-clamp-3 leading-relaxed">
      {guide.bio || "No bio available for this guide."}
    </p>

    <div className="grid grid-cols-2 gap-3 mt-auto">
      <button 
        onClick={() => onViewReviews(guide)}
        className="bg-gray-700 text-gray-300 font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm"
      >
        Read Reviews
      </button>
      <button 
        onClick={() => onHireClick(guide)}
        className="bg-yellow-500 text-gray-900 font-bold py-2 px-3 rounded-lg hover:bg-yellow-400 transition-colors text-sm shadow-lg shadow-yellow-500/20"
      >
        Hire Now
      </button>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for modals
  const [selectedGuideForBooking, setSelectedGuideForBooking] = useState(null);
  const [selectedGuideForReviews, setSelectedGuideForReviews] = useState(null);

  useEffect(() => {
    guidesService.getGuides()
      .then(response => {
        setGuides(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch guides:", error);
        setError('Could not load guides. Please ensure you are logged in.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-yellow-400 mb-3">Hire a Local Expert</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Connect with verified guides who know the safest routes and hidden gems.
        </p>
      </div>
      
      {loading && (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-center max-w-lg mx-auto">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {guides.map(guide => (
            <GuideCard 
              key={guide._id} 
              guide={guide} 
              onHireClick={setSelectedGuideForBooking} 
              onViewReviews={setSelectedGuideForReviews} 
            />
          ))}
        </div>
      )}

      {/* Render Booking Modal */}
      {selectedGuideForBooking && (
        <BookingModal 
          guide={selectedGuideForBooking} 
          onClose={() => setSelectedGuideForBooking(null)} 
        />
      )}

      {/* Render Reviews Modal */}
      {selectedGuideForReviews && (
        <ReviewsListModal 
          guide={selectedGuideForReviews} 
          onClose={() => setSelectedGuideForReviews(null)} 
        />
      )}
    </div>
  );
};

export default Guides;