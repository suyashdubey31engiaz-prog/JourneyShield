import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createBooking } from '../services/bookingService';
import reviewService from '../services/reviewService';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000');

const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
        viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z"/>
      </svg>
    ))}
  </div>
);

const Tag = ({ label, color = 'gray' }) => {
  const c = {
    gray:   'bg-gray-700/60 text-gray-300 border-gray-600/60',
    yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
    cyan:   'bg-cyan-900/30 text-cyan-400 border-cyan-800/50',
    green:  'bg-green-900/30 text-green-400 border-green-800/50',
  }[color] || 'bg-gray-700/60 text-gray-300 border-gray-600/60';
  return <span className={`inline-block text-[11px] font-semibold border rounded-full px-2 py-0.5 ${c}`}>{label}</span>;
};

const GuideCard = ({ guide, onHire, onView }) => {
  const initials = guide.name?.substring(0, 2).toUpperCase() || '??';
  const rating   = Number(guide.guideProfile?.rating  || guide.rating  || 0);
  const reviews  = Number(guide.guideProfile?.reviews || guide.reviews || 0);
  const price    = guide.guideProfile?.pricePerHour;
  const avail    = guide.guideProfile?.availability;
  const langs    = guide.guideProfile?.languages  || [];
  const specs    = guide.guideProfile?.specialties || [];
  const exp      = guide.guideProfile?.experience;
  const loc      = guide.guideProfile?.location   || guide.location;
  const bio      = guide.guideProfile?.bio        || guide.bio;

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden flex flex-col hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
      <div className="h-1.5 bg-gradient-to-r from-yellow-500 to-amber-400" />
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-cyan-700/50 shrink-0 bg-gradient-to-br from-cyan-600 to-cyan-900">
            {guide.avatar
              ? <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl font-extrabold text-white">{initials}</div>
            }
          </div>
          <div className="min-w-0 flex-grow">
            <h3 className="text-white font-extrabold text-base leading-tight">{guide.name}</h3>
            {loc && <p className="text-yellow-400 text-xs font-semibold mt-0.5">📍 {loc}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <Stars rating={rating} />
              <span className="text-yellow-400 text-xs font-bold">{rating > 0 ? rating.toFixed(1) : '—'}</span>
              <span className="text-gray-500 text-xs">({reviews} review{reviews !== 1 ? 's' : ''})</span>
            </div>
          </div>
          {price && <div className="shrink-0 text-right"><p className="text-yellow-400 font-extrabold text-lg leading-none">${price}</p><p className="text-gray-500 text-[10px]">/ hour</p></div>}
        </div>
        {bio && <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">{bio}</p>}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {exp   && <Tag label={`🏅 ${exp}`}  color="yellow" />}
          {avail && <Tag label={`⏰ ${avail}`} color="green"  />}
          {langs.slice(0,3).map(l => <Tag key={l} label={l} color="cyan"   />)}
          {specs.slice(0,2).map(s => <Tag key={s} label={s} color="gray"   />)}
        </div>
        <div className="flex gap-2 mt-auto">
          <button onClick={() => onView(guide)} className="flex-1 bg-gray-700/80 hover:bg-gray-700 text-white text-sm font-bold py-2.5 rounded-xl border border-gray-600 transition-all">View Profile</button>
          <button onClick={() => onHire(guide)} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold py-2.5 rounded-xl transition-all shadow-md shadow-yellow-500/20">Hire Now</button>
        </div>
      </div>
    </div>
  );
};

const PublicReviewRow = ({ review, currentUserId }) => {
  const isMe     = String(review.userId) === String(currentUserId);
  const reviewed = new Date(review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const edited   = review.editCount > 0
    ? new Date(review.updatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
    : null;
  return (
    <div className={`rounded-xl border p-4 ${isMe ? 'bg-yellow-900/10 border-yellow-800/40' : 'bg-gray-900/50 border-gray-700/60'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 text-white ${isMe ? 'bg-yellow-700' : 'bg-cyan-800'}`}>
            {review.reviewer?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-sm font-bold">{review.reviewer}</span>
              {isMe && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-700/50 px-1.5 py-0.5 rounded-full">You</span>}
            </div>
            <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= review.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>)}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-gray-500 text-[11px]">📅 {reviewed}</p>
          {edited && <p className="text-yellow-600/70 text-[11px]">✏️ Edited {review.editCount}× · {edited}</p>}
        </div>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed pl-10 italic">"{review.comment}"</p>
    </div>
  );
};

const ProfileDrawer = ({ guide, onClose, onHire }) => {
  if (!guide) return null;
  const gp      = guide.guideProfile || {};
  const rating  = Number(gp.rating  || guide.rating  || 0);
  const reviews = Number(gp.reviews || guide.reviews || 0);

  const [tab,           setTab]           = useState('profile');
  const [publicReviews, setPublicReviews] = useState([]);
  const [loadingRev,    setLoadingRev]    = useState(false);
  const currentUser = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (tab !== 'reviews') return;
    setLoadingRev(true);
    reviewService.getReviews(guide._id)
      .then(r => setPublicReviews(r.data || []))
      .catch(() => setPublicReviews([]))
      .finally(() => setLoadingRev(false));
  }, [tab, guide._id]);

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: publicReviews.filter(r => r.rating === star).length,
    pct:   publicReviews.length ? Math.round((publicReviews.filter(r => r.rating === star).length / publicReviews.length) * 100) : 0,
  }));

  const sorted = [...publicReviews].sort((a, b) => {
    const am = String(a.userId) === String(currentUser?._id);
    const bm = String(b.userId) === String(currentUser?._id);
    if (am && !bm) return -1; if (!am && bm) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const myReviews = publicReviews.filter(r => String(r.userId) === String(currentUser?._id));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-gray-900 border-l border-gray-700 h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Sticky header */}
        <div className="shrink-0 border-b border-gray-700">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-600 to-cyan-900 shrink-0">
                {guide.avatar
                  ? <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm font-extrabold text-white">
                      {guide.name?.substring(0,2).toUpperCase() || '??'}
                    </div>
                }
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-tight">{guide.name}</h2>
                {(gp.location || guide.location) && <p className="text-yellow-400 text-xs font-semibold">📍 {gp.location || guide.location}</p>}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0">✕</button>
          </div>
          <div className="flex px-6 gap-1">
            {[['profile','👤 Profile'], ['reviews', `⭐ Reviews (${reviews})`]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${tab === key ? 'text-yellow-400 border-yellow-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-grow overflow-y-auto">

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Stars rating={rating} />
                <span className="text-yellow-400 font-bold">{rating > 0 ? rating.toFixed(1) : '—'}</span>
                <span className="text-gray-500 text-sm">({reviews} review{reviews !== 1 ? 's' : ''})</span>
              </div>
              {(gp.bio || guide.bio) && (
                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{gp.bio || guide.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon:'💰', label:'Rate',         val: gp.pricePerHour   ? `$${gp.pricePerHour}/hr` : '—' },
                  { icon:'🏅', label:'Experience',   val: gp.experience     || '—' },
                  { icon:'⏰', label:'Availability', val: gp.availability   || '—' },
                  { icon:'📜', label:'Certs',        val: gp.certifications || '—' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
                    <p className="text-lg mb-1">{icon}</p>
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="text-white font-bold text-sm mt-0.5 truncate">{val}</p>
                  </div>
                ))}
              </div>
              {gp.languages?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🗣️ Languages</p>
                  <div className="flex flex-wrap gap-2">{gp.languages.map(l => <Tag key={l} label={l} color="cyan" />)}</div>
                </div>
              )}
              {gp.specialties?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🎯 Specialties</p>
                  <div className="flex flex-wrap gap-2">{gp.specialties.map(s => <Tag key={s} label={s} color="yellow" />)}</div>
                </div>
              )}
              {(gp.socialLinks?.instagram || gp.socialLinks?.website) && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🔗 Links</p>
                  <div className="flex gap-3">
                    {gp.socialLinks?.instagram && <a href={`https://instagram.com/${gp.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="text-xs text-pink-400 hover:text-pink-300 underline">Instagram</a>}
                    {gp.socialLinks?.website    && <a href={gp.socialLinks.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline">Website</a>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {tab === 'reviews' && (
            <div className="p-6 space-y-4">
              {loadingRev ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-800 animate-pulse rounded-xl" />)}</div>
              ) : publicReviews.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-white font-bold mb-1">No Reviews Yet</p>
                  <p className="text-gray-500 text-sm">Be the first to review after a completed trip.</p>
                </div>
              ) : (
                <>
                  {/* Rating summary */}
                  <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center shrink-0">
                        <p className="text-4xl font-extrabold text-yellow-400 leading-none">{rating > 0 ? rating.toFixed(1) : '—'}</p>
                        <Stars rating={Math.round(rating)} />
                        <p className="text-gray-500 text-xs mt-1">{publicReviews.length} review{publicReviews.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex-grow space-y-1.5">
                        {dist.map(({ star, count, pct }) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-2">{star}</span>
                            <span className="text-yellow-400 text-[10px]">★</span>
                            <div className="flex-grow h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 w-3">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Your review meta note */}
                  {myReviews.length > 0 && currentUser?.role !== 'Guide' && (
                    <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-xl px-4 py-2.5 text-xs text-yellow-400/80 flex items-start gap-2">
                      <span className="shrink-0">⭐</span>
                      <span>
                        You have reviewed this guide {myReviews.length} time{myReviews.length > 1 ? 's' : ''}.
                        {myReviews[0]?.editCount > 0 && ` Edited ${myReviews[0].editCount} time${myReviews[0].editCount > 1 ? 's' : ''}.`}
                        {' '}To edit, go to My Bookings.
                      </span>
                    </div>
                  )}

                  {/* Review list */}
                  <div className="space-y-3">
                    {sorted.map(r => <PublicReviewRow key={r._id} review={r} currentUserId={currentUser?._id} />)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sticky hire CTA */}
        <div className="shrink-0 p-4 border-t border-gray-700 bg-gray-900">
          <button onClick={() => { onClose(); onHire(guide); }}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/20">
            🚀 Hire {guide.name?.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ guide, user, onClose }) => {
  const [date,      setDate]      = useState('');
  const [isGroup,   setIsGroup]   = useState(false);
  const [members,   setMembers]   = useState([{ name:'', age:'', notes:'' }]);
  const [status,    setStatus]    = useState('idle'); // idle | loading | success | error
  const [errMsg,    setErrMsg]    = useState('');

  const inp = 'w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-yellow-500 transition-all';

  const changeMember = (i, field, val) => {
    const m = [...members]; m[i][field] = val; setMembers(m);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await createBooking({
        guideId: guide._id,
        date,
        isPrivateGroup: isGroup,
        groupMembers: isGroup ? members : [],
      }, user.token);
      setStatus('success');
      setTimeout(onClose, 2200);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Failed to send request.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto"
      onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl my-8 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-extrabold text-white">Book a Guide</h3>
            <p className="text-gray-400 text-xs mt-0.5">Sending request to <span className="text-yellow-400 font-semibold">{guide.name}</span></p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all text-sm">
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
            <h4 className="text-xl font-extrabold text-green-400 mb-2">Request Sent!</h4>
            <p className="text-gray-400 text-sm">
              Your booking request has been sent to <span className="text-white font-semibold">{guide.name}</span>. You'll be notified once they respond.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Guide mini-card */}
            <div className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl p-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-600 to-cyan-900 shrink-0">
                {guide.avatar
                  ? <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm font-extrabold text-white">
                      {guide.name?.substring(0,2).toUpperCase()}
                    </div>
                }
              </div>
              <div>
                <p className="text-white font-bold text-sm">{guide.name}</p>
                <p className="text-gray-400 text-xs">{(guide.guideProfile?.location || guide.location) || 'Guide'}</p>
              </div>
              {guide.guideProfile?.pricePerHour && (
                <p className="ml-auto text-yellow-400 font-extrabold text-sm shrink-0">${guide.guideProfile.pricePerHour}/hr</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">📅 Select Date</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                className={`${inp} [color-scheme:dark]`}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            {/* Private group toggle */}
            <div
              className={`flex items-center gap-3 rounded-xl p-4 border cursor-pointer transition-all ${isGroup ? 'bg-yellow-900/15 border-yellow-700/50' : 'bg-gray-800/60 border-gray-700'}`}
              onClick={() => setIsGroup(!isGroup)}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isGroup ? 'bg-yellow-500 border-yellow-500' : 'border-gray-500'}`}>
                {isGroup && <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="currentColor"><path d="M10 3L5 8.5 2 5.5 1 6.5l4 4 6-7z"/></svg>}
              </div>
              <div>
                <p className="text-white text-sm font-bold">Private Group Booking</p>
                <p className="text-gray-400 text-xs">Add members for a group tour</p>
              </div>
            </div>

            {/* Group members */}
            {isGroup && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Group Members</p>
                {members.map((m, i) => (
                  <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-yellow-400">Member {i + 1}</span>
                      {members.length > 1 && (
                        <button type="button"
                          onClick={() => setMembers(members.filter((_, j) => j !== i))}
                          className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Name *</label>
                        <input type="text" required value={m.name} onChange={e => changeMember(i,'name',e.target.value)}
                          placeholder="Full name" className={inp} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Age</label>
                        <input type="number" min="1" value={m.age} onChange={e => changeMember(i,'age',e.target.value)}
                          placeholder="Age" className={inp} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Special Notes</label>
                      <input type="text" value={m.notes} onChange={e => changeMember(i,'notes',e.target.value)}
                        placeholder="Allergies, mobility needs, etc." className={inp} />
                    </div>
                  </div>
                ))}
                <button type="button"
                  onClick={() => setMembers([...members, { name:'', age:'', notes:'' }])}
                  className="w-full py-2.5 text-sm font-bold text-yellow-400 border border-dashed border-yellow-500/40 rounded-xl hover:border-yellow-500/80 hover:bg-yellow-500/5 transition-all">
                  + Add Another Member
                </button>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl">
                ❌ {errMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
                Cancel
              </button>
              <button type="submit" disabled={status === 'loading'}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-yellow-500/20 flex items-center justify-center gap-2">
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending…
                  </>
                ) : '🚀 Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Guides = () => {
  const [guides,      setGuides]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [user,        setUser]        = useState(null);
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState('rating');
  const [hireGuide,   setHireGuide]   = useState(null);
  const [viewGuide,   setViewGuide]   = useState(null);

  useEffect(() => {
    setUser(JSON.parse(sessionStorage.getItem('user')));
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users/guides`);
      setGuides(Array.isArray(data) ? data : data.guides || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load guides.');
    } finally {
      setLoading(false);
    }
  };

  const openHire = (guide) => {
    if (!user) return alert('Please log in to hire a guide.');
    setHireGuide(guide);
  };

  // Search + sort
  const filtered = guides
    .filter(g => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        g.name?.toLowerCase().includes(q) ||
        (g.guideProfile?.location || g.location || '').toLowerCase().includes(q) ||
        g.guideProfile?.specialties?.some(s => s.toLowerCase().includes(q)) ||
        g.guideProfile?.languages?.some(l => l.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.guideProfile?.rating || b.rating || 0)) - (Number(a.guideProfile?.rating || a.rating || 0));
      if (sortBy === 'price')  return (Number(a.guideProfile?.pricePerHour || 999)) - (Number(b.guideProfile?.pricePerHour || 999));
      return (a.name || '').localeCompare(b.name || '');
    });

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="h-8 bg-gray-800 animate-pulse rounded w-64 mb-3" />
      <div className="h-4 bg-gray-800 animate-pulse rounded w-96 mb-10" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-gray-800 animate-pulse rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl text-white animate-fadeIn">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">Hire a Local Expert</h1>
        <p className="text-gray-400 text-sm">Connect with verified guides who know the safest routes and hidden gems.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-400 p-5 rounded-2xl mb-8 flex items-start gap-3">
          <span className="text-xl shrink-0">❌</span>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Search + Sort bar */}
      {!error && (
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-grow">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, city, specialty, language…"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {[['rating','⭐ Rating'],['price','💰 Price'],['name','🔤 Name']].map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  sortBy === key
                    ? 'bg-yellow-500 border-yellow-500 text-black'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-500/40'
                }`}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Count */}
      {!error && (
        <p className="text-xs text-gray-500 mb-5">
          {filtered.length === guides.length
            ? `${guides.length} guide${guides.length !== 1 ? 's' : ''} available`
            : `${filtered.length} of ${guides.length} guides matching "${search}"`}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 && !error ? (
        <div className="text-center py-20 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-bold text-white mb-2">No guides found</p>
          <p className="text-gray-400 text-sm">Try a different search term or clear the filter.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(guide => (
            <GuideCard key={guide._id} guide={guide} onHire={openHire} onView={setViewGuide} />
          ))}
        </div>
      )}

      {/* Profile drawer */}
      {viewGuide && (
        <ProfileDrawer guide={viewGuide} onClose={() => setViewGuide(null)} onHire={openHire} />
      )}

      {/* Booking modal */}
      {hireGuide && user && (
        <BookingModal guide={hireGuide} user={user} onClose={() => setHireGuide(null)} />
      )}
    </div>
  );
};

export default Guides;