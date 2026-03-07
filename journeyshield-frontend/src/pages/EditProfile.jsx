import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import guidesService from '../services/guidesService';

/* ─── Tag Input (for Languages & Specialties) ─── */
const TagInput = ({ label, tags, onChange, placeholder, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (value) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">{label}</label>
      <div className="min-h-[48px] bg-gray-900 border border-gray-600 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-yellow-500 transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-yellow-500/70 hover:text-yellow-300 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(input); }
            if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-grow min-w-[120px] bg-transparent text-white text-sm outline-none placeholder-gray-500 py-1"
        />
      </div>
      {/* Suggestions dropdown */}
      {showSuggestions && input && filtered.length > 0 && (
        <div className="relative">
          <div className="absolute top-1 left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-10 max-h-40 overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addTag(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1.5">Press Enter or pick from suggestions to add</p>
    </div>
  );
};

/* ─── Section Wrapper ─── */
const Section = ({ title, icon, children }) => (
  <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-5">
    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
      <span className="text-xl">{icon}</span>
      <h3 className="text-base font-bold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

/* ─── Main Component ─── */
const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Core
    location: '',
    bio: '',
    // Extended
    experience: '',
    languages: [],
    specialties: [],
    phone: '',
    availability: '',
    pricePerHour: '',
    certifications: '',
    // Social
    socialLinks: { instagram: '', facebook: '', website: '' },
  });

  useEffect(() => {
    guidesService
      .getMyProfile()
      .then((res) => {
        const g = res.data;
        setFormData({
          location:       g.location       || '',
          bio:            g.bio            || '',
          experience:     g.experience     || '',
          languages:      g.languages      || [],
          specialties:    g.specialties    || [],
          phone:          g.phone          || '',
          availability:   g.availability   || '',
          pricePerHour:   g.pricePerHour   != null ? String(g.pricePerHour) : '',
          certifications: g.certifications || '',
          socialLinks: {
            instagram: g.socialLinks?.instagram || '',
            facebook:  g.socialLinks?.facebook  || '',
            website:   g.socialLinks?.website   || '',
          },
        });
      })
      .catch((err) => console.error('Failed to load profile', err))
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const setSocial = (field, value) =>
    setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await guidesService.updateProfile({
        ...formData,
        pricePerHour: formData.pricePerHour ? Number(formData.pricePerHour) : 0,
      });
      setToast('Profile updated successfully! ✅');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Failed to update profile. Please try again. ❌');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const LANGUAGE_SUGGESTIONS = [
    'English', 'Hindi', 'French', 'Spanish', 'German', 'Mandarin',
    'Arabic', 'Japanese', 'Portuguese', 'Bengali', 'Urdu', 'Tamil',
    'Marathi', 'Telugu', 'Gujarati', 'Kannada', 'Punjabi', 'Malayalam',
  ];

  const SPECIALTY_SUGGESTIONS = [
    'Heritage Tours', 'Architecture', 'Food & Culinary', 'Adventure',
    'Photography Tours', 'Wildlife', 'Spiritual & Religious', 'Art & Culture',
    'Night Life', 'Trekking & Hiking', 'Water Sports', 'Budget Travel',
    'Luxury Travel', 'Family Friendly', 'Solo Travelers', 'Festival Tours',
  ];

  const AVAILABILITY_OPTIONS = [
    { value: '', label: 'Select availability...' },
    { value: 'Full-time', label: '🗓️ Full-time' },
    { value: 'Weekdays', label: '📅 Weekdays only' },
    { value: 'Weekends', label: '🌅 Weekends only' },
    { value: 'By Appointment', label: '📞 By Appointment' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10 max-w-3xl space-y-4">
        <div className="h-8 skeleton rounded w-48 mb-8" />
        {[1, 2, 3].map((i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl text-white animate-fadeIn">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 font-bold px-6 py-3 rounded-xl shadow-2xl animate-fadeIn ${
          toast.includes('❌') ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/guide-dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-extrabold text-white">Edit Guide Profile</h1>
        <p className="text-gray-400 text-sm mt-1">
          A complete profile builds trust with travelers and helps you get more bookings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── CORE INFO ── */}
        <Section title="Core Information" icon="👤">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">City / Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Jaipur, Rajasthan"
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Bio / About Me <span className="text-gray-500 font-normal text-xs">(max 500 chars)</span>
            </label>
            <textarea
              rows="4"
              maxLength={500}
              value={formData.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Tell travelers about who you are, your passion for guiding, and what makes your tours unique..."
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all resize-none text-sm"
            />
            <p className="text-xs text-gray-500 text-right mt-1">{formData.bio.length}/500</p>
          </div>
        </Section>

        {/* ── EXPERTISE ── */}
        <Section title="Expertise & Skills" icon="🏆">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Years of Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => set('experience', e.target.value)}
                placeholder="e.g. 5 years, 10+ years"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Hourly Rate (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  value={formData.pricePerHour}
                  onChange={(e) => set('pricePerHour', e.target.value)}
                  placeholder="25"
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <TagInput
            label="Languages Spoken"
            tags={formData.languages}
            onChange={(val) => set('languages', val)}
            placeholder="Add a language..."
            suggestions={LANGUAGE_SUGGESTIONS}
          />

          <TagInput
            label="Tour Specialties"
            tags={formData.specialties}
            onChange={(val) => set('specialties', val)}
            placeholder="Add a specialty..."
            suggestions={SPECIALTY_SUGGESTIONS}
          />

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Certifications / Credentials</label>
            <input
              type="text"
              value={formData.certifications}
              onChange={(e) => set('certifications', e.target.value)}
              placeholder="e.g. Certified Tour Guide – India Tourism Ministry (2021)"
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm"
            />
          </div>
        </Section>

        {/* ── AVAILABILITY & CONTACT ── */}
        <Section title="Availability & Contact" icon="📅">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => set('availability', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all text-sm [color-scheme:dark]"
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Phone Number <span className="text-gray-500 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </Section>

        {/* ── SOCIAL LINKS ── */}
        <Section title="Social & Online Presence" icon="🔗">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <input
                type="text"
                value={formData.socialLinks.instagram}
                onChange={(e) => setSocial('instagram', e.target.value)}
                placeholder="Instagram username (without @)"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <input
                type="text"
                value={formData.socialLinks.facebook}
                onChange={(e) => setSocial('facebook', e.target.value)}
                placeholder="Facebook profile URL or username"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <input
                type="url"
                value={formData.socialLinks.website}
                onChange={(e) => setSocial('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </Section>

        {/* ── PROFILE PREVIEW ── */}
        <Section title="Profile Preview" icon="👁️">
          <div className="flex items-start gap-4 bg-gray-900/60 rounded-xl p-4">
            <div className="w-14 h-14 rounded-full bg-cyan-700 flex items-center justify-center text-xl font-bold text-white shrink-0 border-2 border-gray-600">
              {JSON.parse(sessionStorage.getItem('user'))?.name?.substring(0,2).toUpperCase()}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-white font-bold">{JSON.parse(sessionStorage.getItem('user'))?.name}</p>
              <p className="text-yellow-400 text-sm">{formData.location || 'Location not set'}</p>
              {formData.experience && <p className="text-gray-400 text-xs mt-1">🏆 {formData.experience} experience</p>}
              {formData.pricePerHour > 0 && <p className="text-gray-400 text-xs">💰 ${formData.pricePerHour}/hr</p>}
              {formData.availability && <p className="text-gray-400 text-xs">📅 {formData.availability}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.languages.slice(0, 3).map((l) => (
                  <span key={l} className="text-xs bg-blue-900/40 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full">{l}</span>
                ))}
                {formData.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs bg-yellow-900/40 text-yellow-300 border border-yellow-800/40 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── SUBMIT ── */}
        <div className="flex gap-4 pt-2 pb-8">
          <button
            type="button"
            onClick={() => navigate('/guide-dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving...
              </>
            ) : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;