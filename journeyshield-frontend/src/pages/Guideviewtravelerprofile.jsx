import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};

const initials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const Tag = ({ label, color = 'gray' }) => {
  const c = {
    gray:   'bg-gray-700/60 text-gray-300 border-gray-600/50',
    cyan:   'bg-cyan-900/30 text-cyan-400 border-cyan-700/40',
    pink:   'bg-pink-900/30 text-pink-400 border-pink-700/40',
    yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  }[color] || 'bg-gray-700/60 text-gray-300 border-gray-600/50';
  return (
    <span className={`inline-block text-[11px] font-semibold border rounded-full px-2.5 py-0.5 ${c}`}>
      {label}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500 font-semibold">{label}</p>
        <p className="text-white text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  ) : null;

const Section = ({ title, children }) => (
  <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">{title}</p>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const GuideViewTravelerProfile = () => {
  const { userId }  = useParams();
  const navigate    = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API}/api/users/traveler/${userId}`, auth())
      .then(({ data }) => setProfile(data))
      .catch(err => setError(err.response?.data?.message || 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-2xl space-y-4">
      <div className="h-28 w-28 bg-gray-800 animate-pulse rounded-3xl mx-auto mb-6" />
      {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-800 animate-pulse rounded-2xl" />)}
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-6 py-20 text-center">
      <p className="text-4xl mb-4">🔒</p>
      <p className="text-white font-bold text-lg mb-2">Profile Unavailable</p>
      <p className="text-gray-400 text-sm mb-6">{error}</p>
      <button onClick={() => navigate(-1)}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
        ← Go Back
      </button>
    </div>
  );

  if (!profile) return null;

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl text-white animate-fadeIn">

      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold mb-8 transition-all group">
        <span className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-gray-600 transition-all">←</span>
        Back
      </button>

      {/* Avatar + name */}
      <div className="text-center mb-8">
        <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-gray-600 shadow-xl mx-auto">
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-cyan-700 to-blue-900 flex items-center justify-center text-3xl font-extrabold text-white">
                {initials(profile.name)}
              </div>
          }
        </div>
        <h2 className="text-2xl font-extrabold mt-4">{profile.name}</h2>
        <p className="text-gray-400 text-sm mt-0.5">@{profile.username}</p>
        {profile.homeCity && (
          <p className="text-yellow-400 text-sm font-semibold mt-1">📍 {profile.homeCity}</p>
        )}
        {memberSince && (
          <p className="text-gray-500 text-xs mt-1">Member since {memberSince}</p>
        )}

        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {profile.travelStyle && <Tag label={`✈️ ${profile.travelStyle}`} color="yellow" />}
        </div>
      </div>

      <div className="space-y-4">

        {/* About */}
        {profile.bio && (
          <Section title="About">
            <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
          </Section>
        )}

        {/* Languages + Interests */}
        {(profile.languages?.length > 0 || profile.interests?.length > 0) && (
          <Section title="Interests & Languages">
            {profile.languages?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-semibold mb-2">🗣️ Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages.map(l => <Tag key={l} label={l} color="cyan" />)}
                </div>
              </div>
            )}
            {profile.interests?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-2">🎯 Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map(i => <Tag key={i} label={i} color="pink" />)}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Social links */}
        {(profile.socialLinks?.instagram || profile.socialLinks?.website) && (
          <Section title="Links">
            <div className="flex flex-wrap gap-4">
              {profile.socialLinks?.instagram && (
                <a href={`https://instagram.com/${profile.socialLinks.instagram}`}
                  target="_blank" rel="noreferrer"
                  className="text-sm text-pink-400 hover:text-pink-300 underline transition-colors">
                  📸 Instagram
                </a>
              )}
              {profile.socialLinks?.website && (
                <a href={profile.socialLinks.website}
                  target="_blank" rel="noreferrer"
                  className="text-sm text-green-400 hover:text-green-300 underline transition-colors">
                  🌐 Website
                </a>
              )}
            </div>
          </Section>
        )}

        {/* Privacy notice */}
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">🔐</span>
          <div>
            <p className="text-white font-bold text-sm mb-1">Limited View</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Phone number and emergency contact are private to the traveler.
              A future chat module will allow you to request access — once both parties approve,
              full contact details become visible.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuideViewTravelerProfile;