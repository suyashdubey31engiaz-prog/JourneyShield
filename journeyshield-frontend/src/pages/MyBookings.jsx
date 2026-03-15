import React, { useState, useEffect, useCallback } from 'react';
import {
  getMyBookings, getGuideBookings, updateBookingStatus,
  initiatePayment, travelerConfirmPayment, guideConfirmPayment, getPayment,
} from '../services/bookingService';
import reviewService from '../services/reviewService';
import Toast from '../components/common/Toast';

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

// ── Payment Method Modal ──────────────────────────────────────────────────────
const PaymentMethodModal = ({ booking, onClose, onDone, token }) => {
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [guidePrice,  setGuidePrice]  = useState(0);
  const [priceLoading,setPriceLoading]= useState(true);

  // Fetch guide's pricePerHour from public profile endpoint
  useEffect(() => {
    const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000');
    fetch(`${API}/api/users/guide/${booking.guide._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setGuidePrice(data.pricePerHour || 0))
    .catch(() => setGuidePrice(0))
    .finally(() => setPriceLoading(false));
  }, [booking.guide._id, token]);

  const methods = [
    { id: 'Cash',   icon: '💵', label: 'Cash (Offline)',   desc: 'Pay directly to the guide in person', available: true  },
    { id: 'Online', icon: '📱', label: 'UPI / Online',     desc: 'Pay via UPI, cards, or net banking',  available: false },
  ];

  const handleProceed = async () => {
    if (!selected) return setError('Please select a payment method.');
    if (selected === 'Online') return; // handled by UI
    setLoading(true); setError('');
    try {
      await initiatePayment(booking._id, selected, token);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
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
            <h3 className="text-lg font-extrabold text-white">💳 Choose Payment Method</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Amount: <span className="text-yellow-400 font-bold">{priceLoading ? '...' : `₹${guidePrice}`}</span>
              {' '}· Guide: <span className="text-white">{booking?.guide?.name}</span>
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-3">
          {methods.map(m => (
            <div key={m.id}>
              <button
                onClick={() => m.available ? setSelected(m.id) : null}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  !m.available
                    ? 'border-gray-700 bg-gray-800/40 cursor-not-allowed opacity-60'
                    : selected === m.id
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-gray-700 bg-gray-800/60 hover:border-gray-500'
                }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{m.label}</span>
                      {!m.available && (
                        <span className="text-xs bg-orange-900/40 border border-orange-700/50 text-orange-400 px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{m.desc}</p>
                  </div>
                  {m.available && (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected === m.id ? 'border-yellow-500 bg-yellow-500' : 'border-gray-600'
                    }`}>
                      {selected === m.id && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                  )}
                </div>
              </button>

              {/* Online coming soon message */}
              {selected === 'Online' && m.id === 'Online' && (
                <div className="mt-2 px-4 py-3 bg-orange-900/20 border border-orange-700/40 rounded-xl text-orange-400 text-sm">
                  🚧 Online payment is currently under development. Please use Cash (Offline) mode for now.
                </div>
              )}
            </div>
          ))}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleProceed}
            disabled={loading || !selected || selected === 'Online'}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2">
            {loading
              ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing...</>
              : 'Proceed with Payment →'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Payment Tracking Modal ────────────────────────────────────────────────────
const PaymentTrackingModal = ({ booking, isGuide, user, onClose, onDone }) => {
  const [payment,  setPayment]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(false);
  const [error,    setError]    = useState('');

  const fetchPayment = useCallback(async () => {
    try {
      const data = await getPayment(booking._id, user.token);
      setPayment(data);
    } catch (err) {
      if (err.response?.status === 404) setPayment(null);
      else setError('Failed to load payment details.');
    } finally { setLoading(false); }
  }, [booking._id, user.token]);

  useEffect(() => { fetchPayment(); }, [fetchPayment]);

  const handleTravelerConfirm = async () => {
    setActing(true); setError('');
    try {
      await travelerConfirmPayment(booking._id, user.token);
      await fetchPayment();
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm payment.');
    } finally { setActing(false); }
  };

  const handleGuideConfirm = async () => {
    setActing(true); setError('');
    try {
      await guideConfirmPayment(booking._id, user.token);
      await fetchPayment();
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm receipt.');
    } finally { setActing(false); }
  };

  const STEPS = [
    { key: 'accepted',           icon: '✅', label: 'Booking Accepted',       color: 'text-green-400',  bg: 'bg-green-900/40 border-green-700' },
    { key: 'initiated',          icon: '💳', label: 'Payment Initiated',      color: 'text-yellow-400', bg: 'bg-yellow-900/40 border-yellow-700' },
    { key: 'traveler_confirmed', icon: '🙋', label: 'Traveler Confirmed',     color: 'text-blue-400',   bg: 'bg-blue-900/40 border-blue-700' },
    { key: 'guide_confirmed',    icon: '🎯', label: 'Guide Confirmed Receipt', color: 'text-purple-400', bg: 'bg-purple-900/40 border-purple-700' },
    { key: 'completed',          icon: '🏁', label: 'Tour Completed',         color: 'text-cyan-400',   bg: 'bg-cyan-900/40 border-cyan-700' },
  ];

  const stepIndex = {
    null:               0,
    initiated:          1,
    traveler_confirmed: 2,
    guide_confirmed:    3,
    completed:          4,
  }[payment?.status ?? null];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <div>
            <h3 className="text-lg font-extrabold text-white">📋 Payment & Tour Tracker</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {isGuide ? `Traveler: ${booking?.traveler?.name}` : `Guide: ${booking?.guide?.name}`}
              {' · '}
              {new Date(booking?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-800 animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* Receipt breakdown card */}
              {payment && (
                <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl overflow-hidden">
                  {/* Receipt header */}
                  <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 font-extrabold text-sm">🧾 Payment Receipt</p>
                      <p className="text-gray-400 text-xs">JourneyShield · {payment.currency || 'INR'} · {payment.method}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      payment.status === 'completed'          ? 'bg-green-900/40 border-green-600 text-green-300' :
                      payment.status === 'traveler_confirmed' ? 'bg-blue-900/40 border-blue-600 text-blue-300' :
                                                                'bg-yellow-900/40 border-yellow-600 text-yellow-300'
                    }`}>
                      {payment.status === 'completed' ? '✅ Paid' :
                       payment.status === 'traveler_confirmed' ? '⏳ Awaiting Guide' : '🔄 In Progress'}
                    </span>
                  </div>

                  {/* Receipt rows */}
                  <div className="px-4 py-3 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Booking Amount</span>
                      <span className="text-white font-bold">₹{payment.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Payment Method</span>
                      <span className="text-white text-sm">{payment.method}</span>
                    </div>
                    <div className="border-t border-yellow-500/20 my-1" />
                    <div className="flex justify-between items-center">
                      <span className="text-green-300 text-sm font-bold">Guide Receives</span>
                      <span className="text-green-400 font-extrabold text-base">₹{payment.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="bg-gray-800/40 border-t border-gray-700/40 px-4 py-2.5">
                    <p className="text-gray-500 text-xs text-center">
                      💡 Platform fee & GST will be applied when online payment is enabled
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Journey Timeline</p>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-700" />

                  <div className="space-y-4">
                    {STEPS.map((step, i) => {
                      const done = i <= stepIndex;
                      const timelineEntry = payment?.timeline?.find(t => t.step.includes(step.label));
                      return (
                        <div key={step.key} className="flex items-start gap-4 relative">
                          {/* Step icon */}
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-base shrink-0 z-10 ${
                            done ? step.bg : 'bg-gray-800 border-gray-600'
                          }`}>
                            {done ? step.icon : <span className="text-gray-600 text-xs font-bold">{i+1}</span>}
                          </div>
                          {/* Step content */}
                          <div className={`flex-1 bg-gray-800/60 border rounded-xl p-3 ${done ? 'border-gray-600' : 'border-gray-700 opacity-50'}`}>
                            <p className={`text-sm font-bold ${done ? step.color : 'text-gray-500'}`}>{step.label}</p>
                            {timelineEntry ? (
                              <>
                                <p className="text-gray-400 text-xs mt-0.5">{timelineEntry.note}</p>
                                <p className="text-gray-600 text-xs mt-1">
                                  {new Date(timelineEntry.completedAt).toLocaleString('en-IN', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                  {timelineEntry.completedBy?.name && ` · ${timelineEntry.completedBy.name}`}
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-600 text-xs mt-0.5">Waiting...</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Booking details */}
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 space-y-2">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Booking Details</p>
                {[
                  { label: 'Guide',    value: booking?.guide?.name    || '—' },
                  { label: 'Traveler', value: booking?.traveler?.name || '—' },
                  { label: 'Date',     value: new Date(booking?.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                  { label: 'Type',     value: booking?.isPrivateGroup ? `Private Group (${booking?.groupMembers?.length} members)` : 'Solo' },
                  { label: 'Amount',   value: payment ? `₹${payment.totalAmount?.toFixed(2)}` : '—' },
                  { label: 'Method',   value: payment?.method || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              {/* Action buttons */}
              {payment && !isGuide && payment.status === 'initiated' && (
                <button onClick={handleTravelerConfirm} disabled={acting}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {acting
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Confirming...</>
                    : '✅ I\'ve Paid — Confirm Payment Sent'}
                </button>
              )}

              {payment && isGuide && payment.status === 'traveler_confirmed' && (
                <button onClick={handleGuideConfirm} disabled={acting}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {acting
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Confirming...</>
                    : '🎯 Confirm Payment Received & Complete Tour'}
                </button>
              )}

              {payment?.status === 'completed' && (
                <div className="text-center py-3 bg-green-900/20 border border-green-700/40 rounded-xl">
                  <p className="text-green-400 font-bold">🎉 Tour Completed Successfully!</p>
                  <p className="text-gray-400 text-xs mt-1">Payment confirmed by both parties. This record will be kept for 6 months.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ booking, user, existingReview, onClose, onDone }) => {
  const isEdit    = !!existingReview;
  const guideName = booking?.guide?.name || 'this guide';
  const [rating,  setRating]  = useState(existingReview?.rating  || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [status,  setStatus]  = useState('idle');
  const [errMsg,  setErrMsg]  = useState('');
  const ratingLabels = ['','Poor','Fair','Good','Great','Excellent'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setErrMsg('Please select a star rating.');
    setStatus('loading'); setErrMsg('');
    try {
      await reviewService.createReview({ guideId: booking.guide._id, bookingId: booking._id, rating, comment });
      setStatus('success');
      setTimeout(() => { onDone(); onClose(); }, 1800);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Failed to save review.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-extrabold text-white">{isEdit ? '✏️ Edit Your Review' : '⭐ Leave a Review'}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{isEdit ? `Updating your review for ${guideName}` : `Share your experience with ${guideName}`}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all text-sm">✕</button>
        </div>
        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center text-3xl mx-auto mb-4">{isEdit ? '✏️' : '⭐'}</div>
            <h4 className="text-xl font-extrabold text-green-400 mb-2">{isEdit ? 'Review Updated!' : 'Review Submitted!'}</h4>
            <p className="text-gray-400 text-sm">Thank you for your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400">
              <span className="text-white font-semibold">{guideName}</span>{' · '}
              📅 {new Date(booking.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              {isEdit && existingReview.editCount > 0 && (
                <div className="mt-1 text-xs text-yellow-400/80">Previously edited {existingReview.editCount} time{existingReview.editCount > 1 ? 's' : ''}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Your Rating</label>
              <div className="flex items-center gap-3">
                <StarPicker value={rating} onChange={setRating} />
                {rating > 0 && <span className="text-yellow-400 text-sm font-bold">{['','Poor','Fair','Good','Great','Excellent'][rating]}</span>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Your Review</label>
              <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Describe your experience with this guide..."
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-yellow-500 outline-none resize-none transition-all" />
            </div>
            {errMsg && <p className="text-red-400 text-sm">{errMsg}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl text-sm transition-all">Cancel</button>
              <button type="submit" disabled={status === 'loading'} className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                {status === 'loading' ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</> : isEdit ? '💾 Update Review' : '⭐ Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking, isGuide, user, onStatusUpdate, onReview, onPayment, onTrack }) => {
  const [expanded, setExpanded] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [hasPayment, setHasPayment] = useState(false);

  useEffect(() => {
    if (!isGuide && booking?.status === 'Completed' && booking?.guide?._id) {
      reviewService.getMyReviewForGuide(booking.guide._id, booking._id, user?.token)
        .then(r => setMyReview(r)).catch(() => {});
    }
    // Check if payment exists for Accepted/Completed bookings
    if (['Accepted', 'Completed'].includes(booking?.status)) {
      import('../services/bookingService').then(({ getPayment }) => {
        getPayment(booking._id, user?.token).then(() => setHasPayment(true)).catch(() => setHasPayment(false));
      });
    }
  }, [booking, isGuide, user]);

  const { pill, label } = statusStyle(booking?.status);
  const guideName    = booking?.guide?.name    || 'Unknown Guide';
  const travelerName = booking?.traveler?.name || 'Unknown Traveler';
  const personName   = isGuide ? travelerName : guideName;
  const initials     = personName.charAt(0).toUpperCase();

  const btnLabel = booking?.status === 'Completed' && !isGuide
    ? (myReview ? '✏️ Edit Review' : '⭐ Leave Review')
    : null;

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center text-white font-extrabold text-base shrink-0">
            {initials}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white font-extrabold text-base leading-tight">{personName}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  📅 {new Date(booking?.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${pill}`}>{label}</span>
                {booking?.isPrivateGroup && (
                  <span className="text-xs text-cyan-400 bg-cyan-900/30 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                    👥 Group ({booking.groupMembers?.length})
                  </span>
                )}
              </div>
            </div>

            {/* Guide actions */}
            {isGuide && booking?.status === 'Pending' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => onStatusUpdate(booking._id, 'Accepted')}
                  className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded-xl text-sm transition-all">
                  ✅ Accept
                </button>
                <button onClick={() => onStatusUpdate(booking._id, 'Rejected')}
                  className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-400 font-bold py-2 rounded-xl text-sm transition-all">
                  ❌ Reject
                </button>
              </div>
            )}

            {/* Payment button — Traveler sees on Accepted bookings without payment */}
            {!isGuide && booking?.status === 'Accepted' && !hasPayment && (
              <button onClick={() => onPayment(booking)}
                className="w-full mt-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                💳 Initiate Payment
              </button>
            )}

            {/* Track Payment button — both see on Accepted/Completed with payment */}
            {['Accepted', 'Completed'].includes(booking?.status) && hasPayment && (
              <button onClick={() => onTrack(booking)}
                className="w-full mt-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                📋 View Payment & Track Tour
              </button>
            )}

            {/* Review section */}
            {!isGuide && booking?.status === 'Completed' && (
              <div className="mt-3">
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
                        {myReview.editCount > 0 && <p className="text-yellow-600/70">Edited {myReview.editCount}×</p>}
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs italic line-clamp-2">"{myReview.comment}"</p>
                  </div>
                )}
                {btnLabel && (
                  <button onClick={() => onReview(booking, myReview)}
                    className={`w-full font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                      myReview
                        ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                    }`}>
                    {btnLabel}
                  </button>
                )}
                {booking.isReviewed && !myReview && (
                  <p className="text-center text-gray-500 text-xs py-1">This booking has already been used for a review.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expand group members */}
        {booking?.groupMembers?.length > 0 && (
          <button onClick={() => setExpanded(e => !e)}
            className="w-full mt-3 text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1 transition-colors">
            {expanded ? '▲ Hide' : '▼ Show'} group members ({booking.groupMembers.length})
          </button>
        )}
      </div>

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
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [user,        setUser]        = useState(null);
  const [activeTab,   setActiveTab]   = useState('active');
  const [reviewCtx,   setReviewCtx]   = useState(null);
  const [paymentCtx,  setPaymentCtx]  = useState(null); // booking for PaymentMethodModal
  const [trackCtx,    setTrackCtx]    = useState(null); // booking for PaymentTrackingModal
  const [toast,       setToast]       = useState(null);

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
      await updateBookingStatus(id, status, user.token);
      setToast({ message: `Booking ${status.toLowerCase()} successfully!`, type: 'success' });
      fetchBookings(user);
    } catch {
      setToast({ message: 'Failed to update booking status.', type: 'error' });
    }
  };

  const handlePaymentDone = () => {
    setPaymentCtx(null);
    setToast({ message: '💳 Payment initiated! Track progress below.', type: 'success' });
    fetchBookings(user);
  };

  const handleTrackDone = () => {
    setTrackCtx(null);
    setToast({ message: '🎉 Status updated successfully!', type: 'success' });
    fetchBookings(user);
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          {isGuide ? 'Booking Requests' : 'My Bookings'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isGuide
            ? 'Manage incoming requests, confirm payments, and complete tours.'
            : 'Track your bookings, manage payments, and leave reviews.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Total',     value: bookings.length,                                        color: 'text-white'      },
          { label: 'Active',    value: active.length,                                          color: 'text-yellow-400' },
          { label: 'Completed', value: bookings.filter(b => b?.status === 'Completed').length, color: 'text-green-400'  },
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

      {/* List */}
      {shown.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <p className="text-5xl mb-4">{activeTab === 'active' ? '📭' : '📋'}</p>
          <p className="text-lg font-bold text-white mb-2">No {activeTab} bookings</p>
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
              onPayment={(b) => setPaymentCtx(b)}
              onTrack={(b) => setTrackCtx(b)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {reviewCtx && (
        <ReviewModal
          booking={reviewCtx.booking}
          existingReview={reviewCtx.existingReview}
          user={user}
          onClose={() => setReviewCtx(null)}
          onDone={() => fetchBookings(user)}
        />
      )}

      {paymentCtx && (
        <PaymentMethodModal
          booking={paymentCtx}
          token={user.token}
          onClose={() => setPaymentCtx(null)}
          onDone={handlePaymentDone}
        />
      )}

      {trackCtx && (
        <PaymentTrackingModal
          booking={trackCtx}
          isGuide={isGuide}
          user={user}
          onClose={() => setTrackCtx(null)}
          onDone={handleTrackDone}
        />
      )}
    </div>
  );
};

export default MyBookings;