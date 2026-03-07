import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import travelerService from '../services/travelerService';

/* ─── Tag Input ──────────────────────────────────────────────────────────── */
const TagInput = ({ label, tags, onChange, placeholder, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const [open, setOpen]   = useState(false);

  const add = (v) => {
    const t = v.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput(''); setOpen(false);
  };
  const remove = (tag) => onChange(tags.filter((t) => t !== tag));
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">{label}</label>
      <div className="min-h-[48px] bg-gray-900 border border-gray-600 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-yellow-500 transition-all">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="text-yellow-500/70 hover:text-yellow-300 leading-none">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(input); }
            if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1]);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-grow min-w-[120px] bg-transparent text-white text-sm outline-none placeholder-gray-500 py-1"
        />
      </div>
      {open && input && filtered.length > 0 && (
        <div className="relative">
          <div className="absolute top-1 left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-10 max-h-36 overflow-y-auto">
            {filtered.map((s) => (
              <button key={s} type="button" onMouseDown={() => add(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1.5">Press Enter or pick from suggestions</p>
    </div>
  );
};

/* ─── Section ────────────────────────────────────────────────────────────── */
const Section = ({ title, icon, children }) => (
  <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-5">
    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
      <span className="text-xl">{icon}</span>
      <h3 className="text-base font-bold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

/* ─── Main ───────────────────────────────────────────────────────────────── */
const TravelerEditProfile = () => {
  const navigate       = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState({ msg: '', ok: true });

  const [form, setForm] = useState({
    bio: '', homeCity: '', phone: '', travelStyle: '',
    interests: [], languages: [],
    medicalNotes: '',
    emergencyContact: { name: '', phone: '', relation: '' },
    socialLinks: { instagram: '', facebook: '', website: '' },
  });

  useEffect(() => {
    travelerService.getMyProfile()
      .then((res) => {
        const u = res.data;
        setForm({
          bio:          u.bio          || '',
          homeCity:     u.homeCity     || '',
          phone:        u.phone        || '',
          travelStyle:  u.travelStyle  || '',
          interests:    u.interests    || [],
          languages:    u.languages    || [],
          medicalNotes: u.medicalNotes || '',
          emergencyContact: {
            name:     u.emergencyContact?.name     || '',
            phone:    u.emergencyContact?.phone    || '',
            relation: u.emergencyContact?.relation || '',
          },
          socialLinks: {
            instagram: u.socialLinks?.instagram || '',
            facebook:  u.socialLinks?.facebook  || '',
            website:   u.socialLinks?.website   || '',
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setEC  = (k, v) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, [k]: v } }));
  const setSoc = (k, v) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const flash = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await travelerService.updateProfile(form);
      flash('Profile updated! ✅');
    } catch {
      flash('Failed to save. Please try again. ❌', false);
    } finally {
      setSaving(false);
    }
  };

  const user = JSON.parse(sessionStorage.getItem('user'));

  const STYLES = [
    { value: '',            label: 'Select your travel style…' },
    { value: 'Adventure',   label: '🧗 Adventure' },
    { value: 'Leisure',     label: '🏖️ Leisure & Relaxation' },
    { value: 'Cultural',    label: '🏛️ Cultural & Heritage' },
    { value: 'Budget',      label: '💸 Budget Travel' },
    { value: 'Luxury',      label: '✨ Luxury' },
    { value: 'Solo',        label: '🧍 Solo Travel' },
    { value: 'Family',      label: '👨‍👩‍👧 Family' },
    { value: 'Backpacking', label: '🎒 Backpacking' },
  ];

  const INTERESTS = [
    'Temples & Shrines','Street Food','Hiking','Photography','Wildlife',
    'History','Architecture','Night Life','Shopping','Museums','Beaches',
    'Mountains','Waterfalls','Local Markets','Yoga & Wellness','Water Sports',
    'Cycling','Volunteering','Festivals','Art & Galleries',
  ];

  const LANGS = [
    'English','Hindi','French','Spanish','German','Mandarin','Arabic',
    'Japanese','Portuguese','Bengali','Urdu','Tamil','Marathi','Telugu',
    'Gujarati','Kannada','Punjabi','Malayalam',
  ];

  const RELATIONS = ['Parent','Spouse','Partner','Sibling','Friend','Other'];

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-3xl space-y-4">
      <div className="h-8 skeleton rounded w-48 mb-8" />
      {[1,2,3,4].map((i) => <div key={i} className="h-44 skeleton rounded-2xl" />)}
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl text-white animate-fadeIn">

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 font-bold px-6 py-3 rounded-xl shadow-2xl animate-fadeIn text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-700 flex items-center justify-center text-2xl font-bold text-white border-2 border-gray-700">
            {user?.name?.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Edit Traveler Profile</h1>
            <p className="text-gray-400 text-sm">Help guides personalise your experience</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── ABOUT ME ── */}
        <Section title="About Me" icon="🧳">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Home City</label>
              <input value={form.homeCity} onChange={(e) => set('homeCity', e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Phone Number <span className="text-gray-500 font-normal text-xs">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Bio <span className="text-gray-500 font-normal text-xs">(max 300 chars)</span></label>
            <textarea rows="3" maxLength={300} value={form.bio} onChange={(e) => set('bio', e.target.value)}
              placeholder="Tell guides about yourself — your travel history, what kind of traveler you are…"
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none resize-none text-sm transition-all" />
            <p className="text-xs text-gray-500 text-right mt-1">{form.bio.length}/300</p>
          </div>
        </Section>

        {/* ── TRAVEL PREFERENCES ── */}
        <Section title="Travel Preferences" icon="🗺️">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Travel Style</label>
            <select value={form.travelStyle} onChange={(e) => set('travelStyle', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm [color-scheme:dark]">
              {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <TagInput label="Travel Interests" tags={form.interests}
            onChange={(v) => set('interests', v)} placeholder="Add an interest…" suggestions={INTERESTS} />

          <TagInput label="Languages Spoken" tags={form.languages}
            onChange={(v) => set('languages', v)} placeholder="Add a language…" suggestions={LANGS} />
        </Section>

        {/* ── EMERGENCY CONTACT ── */}
        <Section title="Emergency Contact" icon="🚨">
          <p className="text-xs text-gray-400 -mt-2">Only shared with your guide if there's an emergency during the trip.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Contact Name</label>
              <input value={form.emergencyContact.name} onChange={(e) => setEC('name', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Their Phone Number</label>
              <input type="tel" value={form.emergencyContact.phone} onChange={(e) => setEC('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none text-sm transition-all" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-bold text-gray-300 mb-2">Relationship</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONS.map((r) => (
                  <button key={r} type="button" onClick={() => setEC('relation', r)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      form.emergencyContact.relation === r
                        ? 'bg-yellow-500 border-yellow-500 text-black'
                        : 'bg-gray-900 border-gray-600 text-gray-300 hover:border-yellow-500/50'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── MEDICAL NOTES ── */}
        <Section title="Medical & Accessibility Notes" icon="🏥">
          <p className="text-xs text-gray-400 -mt-2">Optional. Helps guides plan activities suited to your needs.</p>
          <textarea rows="3" value={form.medicalNotes} onChange={(e) => set('medicalNotes', e.target.value)}
            placeholder="e.g. Allergic to peanuts, Asthma, Uses a wheelchair, Afraid of heights, Diabetic…"
            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none resize-none text-sm transition-all" />
        </Section>

        {/* ── SOCIAL LINKS ── */}
        <Section title="Social & Online Presence" icon="🔗">
          {[
            { key: 'instagram', placeholder: 'Instagram username (without @)',   icon: '📸', color: 'text-pink-400' },
            { key: 'facebook',  placeholder: 'Facebook profile URL or username', icon: '👥', color: 'text-blue-400' },
            { key: 'website',   placeholder: 'https://yourwebsite.com',          icon: '🌐', color: 'text-gray-400' },
          ].map(({ key, placeholder, icon, color }) => (
            <div key={key} className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-base ${color}`}>{icon}</span>
              <input
                type={key === 'website' ? 'url' : 'text'}
                value={form.socialLinks[key]}
                onChange={(e) => setSoc(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none text-sm transition-all" />
            </div>
          ))}
        </Section>

        {/* ── PROFILE PREVIEW ── */}
        <Section title="Profile Preview" icon="👁️">
          <div className="flex items-start gap-4 bg-gray-900/60 rounded-xl p-4">
            <div className="w-14 h-14 rounded-full bg-cyan-700 flex items-center justify-center text-xl font-bold text-white shrink-0 border-2 border-gray-600">
              {user?.name?.substring(0,2).toUpperCase()}
            </div>
            <div className="flex-grow">
              <p className="text-white font-bold">{user?.name}</p>
              <p className="text-yellow-400 text-sm">{form.homeCity ? `🏠 ${form.homeCity}` : 'Home city not set'}</p>
              {form.travelStyle && <p className="text-gray-400 text-xs mt-1">{STYLES.find(s=>s.value===form.travelStyle)?.label}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.interests.slice(0,4).map((i) => (
                  <span key={i} className="text-xs bg-yellow-900/40 text-yellow-300 border border-yellow-800/40 px-2 py-0.5 rounded-full">{i}</span>
                ))}
                {form.languages.slice(0,3).map((l) => (
                  <span key={l} className="text-xs bg-blue-900/40 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── ACTIONS ── */}
        <div className="flex gap-4 pt-2 pb-8">
          <button type="button" onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2">
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving…
              </>
            ) : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelerEditProfile;