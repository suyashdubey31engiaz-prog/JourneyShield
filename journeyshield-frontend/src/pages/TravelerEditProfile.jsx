import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};

const inp = 'w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all';

const TRAVEL_STYLES = ['Adventure', 'Cultural', 'Leisure', 'Budget', 'Luxury', 'Solo', 'Family'];
const INTEREST_OPTS = ['Temples', 'Museums', 'Mountains', 'Beaches', 'Food', 'Photography', 'History', 'Wildlife', 'Shopping', 'Nightlife', 'Architecture', 'Festivals'];
const LANG_OPTS     = ['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Gujarati', 'Punjabi', 'French', 'Spanish', 'German', 'Japanese'];

const TravelerEditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: '', homeCity: '', phone: '', travelStyle: '',
    interests: [], languages: [],
    emergencyContact: { name: '', phone: '', relation: '' },
    socialLinks: { instagram: '', website: '' },
  });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ type: '', text: '' });
  const [customInterest, setCustomInterest] = useState('');
  const [customLang,     setCustomLang]     = useState('');

  useEffect(() => {
    axios.get(`${API}/api/users/me`, auth())
      .then(({ data }) => {
        setForm({
          bio:         data.bio         || '',
          homeCity:    data.homeCity    || '',
          phone:       data.phone       || '',
          travelStyle: data.travelStyle || '',
          interests:   data.interests   || [],
          languages:   data.languages   || [],
          emergencyContact: {
            name:     data.emergencyContact?.name     || '',
            phone:    data.emergencyContact?.phone    || '',
            relation: data.emergencyContact?.relation || '',
          },
          socialLinks: {
            instagram: data.socialLinks?.instagram || '',
            website:   data.socialLinks?.website   || '',
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setNested = (section, field, val) =>
    setForm(f => ({ ...f, [section]: { ...f[section], [field]: val } }));

  const toggleArr = (field, val) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter(v => v !== val)
        : [...f[field], val],
    }));

  const addCustom = (field, val, reset) => {
    const v = val.trim();
    if (!v || form[field].includes(v)) return;
    setForm(f => ({ ...f, [field]: [...f[field], v] }));
    reset('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await axios.put(`${API}/api/users/me`, form, auth());
      setMsg({ type: 'success', text: '✅ Profile saved!' });
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || '❌ Save failed.' });
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-2xl space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-800 animate-pulse rounded-2xl" />)}
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl text-white animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
          ←
        </button>
        <h1 className="text-2xl font-extrabold">Edit Traveler Profile</h1>
      </div>

      {msg.text && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-bold ${
          msg.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800/40' : 'bg-red-900/20 text-red-400 border border-red-800/40'
        }`}>{msg.text}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Basic Info</p>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Bio</label>
            <textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="Tell guides a bit about yourself..."
              className={`${inp} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Home City</label>
              <input type="text" value={form.homeCity} onChange={e => set('homeCity', e.target.value)}
                placeholder="e.g. Mumbai" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Phone <span className="text-gray-500 font-normal">(private)</span></label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX" className={inp} />
            </div>
          </div>
        </div>

        {/* Travel style */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Travel Style</p>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map(s => (
              <button key={s} type="button"
                onClick={() => set('travelStyle', form.travelStyle === s ? '' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.travelStyle === s
                    ? 'bg-yellow-500 border-yellow-500 text-black'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-yellow-500/40'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Interests</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {INTEREST_OPTS.map(i => (
              <button key={i} type="button"
                onClick={() => toggleArr('interests', i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.interests.includes(i)
                    ? 'bg-pink-900/40 border-pink-600 text-pink-300'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-pink-500/40'
                }`}>
                {i}
              </button>
            ))}
            {form.interests.filter(i => !INTEREST_OPTS.includes(i)).map(i => (
              <button key={i} type="button" onClick={() => toggleArr('interests', i)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-pink-900/40 border-pink-600 text-pink-300">
                {i} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customInterest} onChange={e => setCustomInterest(e.target.value)}
              placeholder="Add custom..." className={`${inp} flex-grow`} />
            <button type="button"
              onClick={() => addCustom('interests', customInterest, setCustomInterest)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold px-4 rounded-xl text-sm transition-all">
              +
            </button>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Languages Spoken</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {LANG_OPTS.map(l => (
              <button key={l} type="button"
                onClick={() => toggleArr('languages', l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.languages.includes(l)
                    ? 'bg-cyan-900/40 border-cyan-600 text-cyan-300'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-cyan-500/40'
                }`}>
                {l}
              </button>
            ))}
            {form.languages.filter(l => !LANG_OPTS.includes(l)).map(l => (
              <button key={l} type="button" onClick={() => toggleArr('languages', l)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-cyan-900/40 border-cyan-600 text-cyan-300">
                {l} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customLang} onChange={e => setCustomLang(e.target.value)}
              placeholder="Add language..." className={`${inp} flex-grow`} />
            <button type="button"
              onClick={() => addCustom('languages', customLang, setCustomLang)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold px-4 rounded-xl text-sm transition-all">
              +
            </button>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">🆘 Emergency Contact <span className="text-gray-600 font-normal normal-case">(private — never shared)</span></p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Full Name</label>
              <input type="text" value={form.emergencyContact.name}
                onChange={e => setNested('emergencyContact', 'name', e.target.value)}
                placeholder="Contact's name" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Phone</label>
              <input type="tel" value={form.emergencyContact.phone}
                onChange={e => setNested('emergencyContact', 'phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX" className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Relation</label>
              <input type="text" value={form.emergencyContact.relation}
                onChange={e => setNested('emergencyContact', 'relation', e.target.value)}
                placeholder="e.g. Parent, Sibling, Friend" className={inp} />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Social Links</p>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Instagram handle</label>
            <input type="text" value={form.socialLinks.instagram}
              onChange={e => setNested('socialLinks', 'instagram', e.target.value)}
              placeholder="your_handle" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Website</label>
            <input type="url" value={form.socialLinks.website}
              onChange={e => setNested('socialLinks', 'website', e.target.value)}
              placeholder="https://yoursite.com" className={inp} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/profile')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            {saving
              ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
              : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelerEditProfile;