import React, { useState, useEffect } from 'react';
import guidesService from '../services/guidesService';
import reviewService from '../services/reviewService';

const Stars = ({ rating, size = 'sm' }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} xmlns="http://www.w3.org/2000/svg"
        className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} ${s <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
        viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z"/>
      </svg>
    ))}
  </div>
);

const GuideReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats,   setStats]   = useState({ rating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState('newest');

  useEffect(() => {
    guidesService.getMyProfile()
      .then(res => {
        const g = res.data;
        setStats({ rating: g.rating || 0, count: g.reviews || 0 });
        return reviewService.getReviews(g._id);
      })
      .then(res => setReviews(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...reviews].sort((a, b) =>
    sort === 'newest'  ? new Date(b.updatedAt) - new Date(a.updatedAt) :
    sort === 'highest' ? b.rating - a.rating :
                         a.rating - b.rating
  );

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const avg = stats.rating ? Number(stats.rating).toFixed(1) : '—';
  const sentiment =
    stats.rating >= 4.5 ? { label: 'Exceptional', color: 'text-green-400' } :
    stats.rating >= 4.0 ? { label: 'Great',        color: 'text-teal-400'  } :
    stats.rating >= 3.5 ? { label: 'Good',         color: 'text-yellow-400'} :
    stats.rating >= 3.0 ? { label: 'Average',      color: 'text-amber-400' } :
                          { label: 'Needs work',   color: 'text-red-400'   };

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-3xl space-y-4">
      <div className="h-8 bg-gray-800 animate-pulse rounded w-40 mb-8" />
      <div className="h-44 bg-gray-800 animate-pulse rounded-2xl" />
      {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-800 animate-pulse rounded-2xl" />)}
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl text-white animate-fadeIn">

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">My Reviews</h1>
        <p className="text-gray-400 text-sm mt-1">Feedback left by travelers after completed trips.</p>
      </div>

      {/* Stats card */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-700 pb-6 sm:pb-0 sm:pr-6">
            <p className="text-7xl font-extrabold text-yellow-400 leading-none mb-2">{avg}</p>
            <Stars rating={Math.round(stats.rating)} size="lg" />
            <p className={`text-sm font-bold mt-2 ${sentiment.color}`}>{sentiment.label}</p>
            <p className="text-gray-500 text-xs mt-1">{stats.count} review{stats.count !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-2.5 self-center">
            {dist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-2 shrink-0">{star}</span>
                <svg className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z"/>
                </svg>
                <div className="flex-grow h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-5 shrink-0 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <p className="text-5xl mb-4">⭐</p>
          <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Reviews appear once a traveler marks a booking as complete and leaves feedback.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              {[['newest','🕐 Newest'],['highest','⬆️ Highest'],['lowest','⬇️ Lowest']].map(([key, label]) => (
                <button key={key} onClick={() => setSort(key)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    sort === key
                      ? 'bg-yellow-500 border-yellow-500 text-black'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-500/40'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sorted.map(review => (
              <div key={review._id}
                className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 hover:border-yellow-500/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {review.user?.name?.substring(0,2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{review.user?.name || 'Traveler'}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(review.updatedAt || review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Stars rating={review.rating} />
                    <span className="text-xs text-gray-500">{review.rating} / 5</span>
                  </div>
                </div>
                <div className="pl-4 border-l-2 border-yellow-500/40">
                  <p className="text-gray-200 text-sm leading-relaxed italic">"{review.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GuideReviews;