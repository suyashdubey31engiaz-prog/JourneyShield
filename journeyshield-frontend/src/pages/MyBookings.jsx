import React, { useState, useEffect, useCallback } from 'react';
import { getMyBookings, getGuideBookings, updateBookingStatus } from '../services/bookingService';
import reviewService from '../services/reviewService';

// ── Status helpers ────────────────────────────────────────────────────────────
const statusStyle = (s) => ({
  Pending:   { pill: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50', label: '⏳ Pending'   },
  Accepted:  { pill: 'bg-green-900/40  text-green-400  border-green-800/50',  label: '✅ Accepted'  },
  Completed: { pill: 'bg-blue-900/40   text-blue-400   border-blue-800/50',   label: '🏁 Completed' },
  Rejected:  { pill: 'bg-red-900/40    text-red-400    border-red-800/50',    label: '❌ Rejected'  },
}[s] || { pill: 'bg-gray-800 text-gray-400 border-gray-700', label: s });

// ── Star picker ───────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} type="button" onClick={() => onChange(s)}
        className={`text-2xl transition-transform hover:scale-110 ${s <= value ? 'text-yellow-400' : 'text-gray-600'}`}>
        ★
      </button>
    ))}
  </div>
);

// ── Review Modal ──────────────────────────────────────────────────────────────
// Handles both "Leave a Review" (first time) and "Edit Your Review" (subsequent)
const ReviewModal = ({ booking, user, existingReview, onClose, onDone }) => {
  const isEdit   = !!existingReview;
  const guideName = booking?.guide?.name || 'this guide';

  const [rating,   setRating]   = useState(existingReview?.rating  || 0);
  const [comment,  setComment]  = useState(existingReview?.comment || '');
  const [status,   setStatus]   = useState('idle'); // idle | loading | success | error
  const [errMsg,   setErrMsg]   = useState('');

  const ratingLabels = ['','Poor','Fair','Good','Great','Excellent'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setErrMsg('Please select a star rating.');
    setStatus('loading'); setErrMsg('');

    try {
      await reviewService.createReview({
        guideId:   booking.guide._id,
        bookingId: booking._id,
        rating,
        comment,
      });
      setStatus('success');
      setTimeout(() => { onDone(); onClose(); }, 1800);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Failed to save review.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-extrabold text-white">
              {isEdit ? '✏️ Edit Your Review' : '⭐ Leave a Review'}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {isEdit
                ? `Updating your review for ${guideName}`
                : `Share your experience with ${guideName}`}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all text-sm">
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center text-3xl mx-auto mb-4">
              {isEdit ? '✏️' : '⭐'}
            </div>
            <h4 className="text-xl font-extrabold text-green-400 mb-2">
              {isEdit ? 'Review Updated!' : 'Review Submitted!'}
            </h4>
            <p className="text-gray-400 text-sm">Thank you for your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Context: which booking */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400">
              <span className="text-white font-semibold">{guideName}</span>
              {' · '}
              📅 {new Date(booking.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              {isEdit && (
                <div className="mt-1 text-xs text-yellow-400/80">
                  {existingReview.editCount > 0
                    ? `Previously edited ${existingReview.editCount} time${existingReview.editCount > 1 ? 's' : ''}`
                    : 'First edit'}
                </div>
              )}
            </div>

            {/* Star picker */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Your Rating</label>
              <div className="flex items-center gap-3">
                <StarPicker value={rating} onChange={setRating} />
                {rating > 0 && (
                  <span className="text-yellow-400 text-sm font-bold">{ratingLabels[rating]}</span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Your Comment</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe your experience — what went well, what could improve..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-yellow-500 transition-all resize-none"
              />
              <p className="text-gray-600 text-xs mt-1 text-right">{comment.length} chars</p>
            </div>

            {errMsg && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl">
                ❌ {errMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
                Cancel
              </button>
              <button type="submit" disabled={status === 'loading'}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                {status === 'loading'
                  ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
                  : isEdit ? '✏️ Save Edit' : '⭐ Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking, isGuide, user, onStatusUpdate, onReview }) => {
  const [myReview,   setMyReview]   = useState(undefined); // undefined=loading, null=none, obj=exists
  const [expanded,   setExpanded]   = useState(false);
  const [updating,   setUpdating]   = useState('');

  const st  = statusStyle(booking?.status);
  const who = isGuide ? booking?.traveler : booking?.guide;

  // For traveler: fetch their existing review for this guide when booking is completed
  useEffect(() => {
    if (!isGuide && booking?.status === 'Completed' && booking?.guide?._id) {
      reviewService.getMyReview(booking.guide._id)
        .then(r => setMyReview(r.data))   // null if no review yet
        .catch(() => setMyReview(null));
    }
  }, [booking, isGuide]);

  const handleStatus = async (status) => {
    setUpdating(status);
    await onStatusUpdate(booking._id, status);
    setUpdating('');
  };

  // What should the review button say?
  const reviewButtonLabel = () => {
    if (booking.isReviewed && myReview) return '✏️ Edit Review';   // used a booking + has review = can edit
    if (booking.isReviewed && !myReview) return null;               // booking already used, review from elsewhere
    if (!booking.isReviewed) return '⭐ Leave a Review';            // unused booking = fresh review slot
    return null;
  };

  const btnLabel = !isGuide && booking?.status === 'Completed' ? reviewButtonLabel() : null;

  return (
    <div className={`bg-gray-800/60 border rounded-2xl overflow-hidden transition-all ${
      booking?.status === 'Pending' ? 'border-yellow-800/40' : 'border-gray-700'
    }`}>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">

          {/* Avatar + name + date */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-600 to-amber-800 flex items-center justify-center text-white font-extrabold shrink-0">
              {who?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">
                <span className="text-gray-400 font-normal">{isGuide ? 'From: ' : 'Guide: '}</span>
                <span className="text-yellow-400">{who?.name || 'Unknown'}</span>
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                📅 {booking?.date
                  ? new Date(booking.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
                  : 'Date TBD'}
              </p>
              {booking?.isPrivateGroup && (
                <span className="inline-block mt-1 text-[11px] font-bold bg-purple-900/40 text-purple-400 border border-purple-800/50 px-2 py-0.5 rounded-full">
                  👥 Private Group · {booking.groupMembers?.length || 0} members
                </span>
              )}
            </div>
          </div>

          {/* Status pill + expand toggle */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${st.pill}`}>
              {st.label}
            </span>
            {booking?.isPrivateGroup && booking?.groupMembers?.length > 0 && (
              <button onClick={() => setExpanded(!expanded)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                {expanded ? '▲ Less' : '▼ Details'}
              </button>
            )}
          </div>
        </div>

        {/* ── Guide actions ── */}
        {isGuide && booking?.status === 'Pending' && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700/50">
            <button onClick={() => handleStatus('Accepted')} disabled={!!updating}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {updating === 'Accepted'
                ? <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : '✅'} Accept
            </button>
            <button onClick={() => handleStatus('Rejected')} disabled={!!updating}
              className="flex-1 bg-red-600/80 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {updating === 'Rejected'
                ? <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : '❌'} Decline
            </button>
          </div>
        )}

        {isGuide && booking?.status === 'Accepted' && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <button onClick={() => handleStatus('Completed')} disabled={!!updating}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {updating === 'Completed'
                ? <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : '🏁'} Mark as Completed
            </button>
          </div>
        )}

        {/* ── Traveler review button ── */}
        {!isGuide && booking?.status === 'Completed' && myReview !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            {/* Show their existing review summary if they have one */}
            {myReview && (
              <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-xl px-4 py-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 text-sm font-bold">Your Review</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-xs ${s <= myReview.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 text-right">
                    <p>Reviewed {new Date(myReview.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                    {myReview.editCount > 0 && (
                      <p className="text-yellow-600/70">Edited {myReview.editCount}×</p>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-xs italic line-clamp-2">"{myReview.comment}"</p>
              </div>
            )}

            {btnLabel && (
              <button
                onClick={() => onReview(booking, myReview)}
                className={`w-full font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                  myReview
                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                }`}>
                {btnLabel}
              </button>
            )}

            {/* Booking already used but review was from a different booking slot */}
            {booking.isReviewed && !myReview && (
              <p className="text-center text-gray-500 text-xs py-1">This booking has already been used for a review.</p>
            )}
          </div>
        )}
      </div>

      {/* Expanded group members */}
      {expanded && booking?.groupMembers?.length > 0 && (
        <div className="border-t border-gray-700/50 bg-gray-900/40 px-5 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Group Members</p>
          <div className="space-y-2">
            {booking.groupMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {m?.name?.charAt(0).toUpperCase() || i+1}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-white text-sm font-semibold">{m?.name || `Member ${i+1}`}</p>
                  {m?.notes && <p className="text-gray-500 text-xs italic">{m.notes}</p>}
                </div>
                {m?.age && <span className="text-xs text-gray-400 shrink-0">Age {m.age}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyBookings = () => {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [user,       setUser]       = useState(null);
  const [activeTab,  setActiveTab]  = useState('active');
  const [reviewCtx,  setReviewCtx]  = useState(null); // { booking, existingReview }

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem('user'));
    if (u) { setUser(u); fetchBookings(u); }
    else setLoading(false);
  }, []);

  const fetchBookings = async (u) => {
    try {
      const data = u.role === 'Guide'
        ? await getGuideBookings(u.token)
        : await getMyBookings(u.token);
      setBookings(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const { updateBookingStatus } = await import('../services/bookingService');
      await updateBookingStatus(id, status, user.token);
      fetchBookings(user);
    } catch { alert('Failed to update status.'); }
  };

  const isGuide = user?.role === 'Guide';
  const active  = bookings.filter(b => ['Pending','Accepted'].includes(b?.status));
  const past    = bookings.filter(b => ['Completed','Rejected'].includes(b?.status));
  const shown   = activeTab === 'active' ? active : past;

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-3xl space-y-4">
      <div className="h-8 bg-gray-800 animate-pulse rounded w-56 mb-8" />
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-800 animate-pulse rounded-2xl" />)}
    </div>
  );

  if (!user) return <div className="text-center py-20 text-gray-400">Please log in to view bookings.</div>;

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl text-white animate-fadeIn">

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          {isGuide ? 'Booking Requests' : 'My Bookings'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isGuide
            ? 'Accept or decline incoming requests from travelers.'
            : 'Track your bookings and leave reviews for completed trips.'}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Total',     value: bookings.length,                                         color: 'text-white'      },
          { label: 'Active',    value: active.length,                                           color: 'text-yellow-400' },
          { label: 'Completed', value: bookings.filter(b => b?.status === 'Completed').length,  color: 'text-green-400'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/60 border border-gray-700 rounded-xl p-1 mb-6">
        {[['active','Active',active.length],['past','Past',past.length]].map(([key,label,count]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === key ? 'bg-yellow-500 text-black shadow' : 'text-gray-400 hover:text-white'
            }`}>
            {label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === key ? 'bg-black/20 text-black' : 'bg-gray-700 text-gray-300'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Booking list */}
      {shown.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <p className="text-5xl mb-4">{activeTab === 'active' ? '📭' : '📋'}</p>
          <p className="text-lg font-bold text-white mb-2">
            No {activeTab} bookings
          </p>
          <p className="text-gray-400 text-sm">
            {isGuide && activeTab === 'active'
              ? "You'll see incoming requests here when travelers book you."
              : activeTab === 'active'
              ? 'Head to the Guides page to book a private guide.'
              : 'Completed and rejected bookings appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map(booking => (
            <BookingCard
              key={booking?._id}
              booking={booking}
              isGuide={isGuide}
              user={user}
              onStatusUpdate={handleStatusUpdate}
              onReview={(b, existingReview) => setReviewCtx({ booking: b, existingReview })}
            />
          ))}
        </div>
      )}

      {/* Review modal */}
      {reviewCtx && (
        <ReviewModal
          booking={reviewCtx.booking}
          existingReview={reviewCtx.existingReview}
          user={user}
          onClose={() => setReviewCtx(null)}
          onDone={() => fetchBookings(user)}
        />
      )}
    </div>
  );
};

export default MyBookings;