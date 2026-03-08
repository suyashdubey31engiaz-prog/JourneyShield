import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};

const inp = 'w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all';

const LANG_OPTS     = ['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Gujarati', 'Punjabi', 'French', 'Spanish', 'German', 'Japanese'];
const SPECIALTY_OPTS= ['Religious Tours', 'Historical Sites', 'Wildlife', 'Trekking', 'Food Tours', 'Photography', 'City Tours', 'River Trips', 'Architecture', 'Cultural Shows'];

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: '', location: '', experience: '', phone: '',
    availability: '', pricePerHour: '',
    certifications: '', languages: [], specialties: [],
    socialLinks: { instagram: '', facebook: '', website: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState({ type: '', text: '' });
  const [customLang,  setCustomLang]  = useState('');
  const [customSpec,  setCustomSpec]  = useState('');

  useEffect(() => {
    axios.get(`${API}/api/guides/me`, auth())
      .then(({ data }) => {
        setForm({
          bio:            data.bio            || '',
          location:       data.location       || '',
          experience:     data.experience     || '',
          phone:          data.phone          || '',
          availability:   data.availability   || '',
          pricePerHour:   data.pricePerHour   || '',
          certifications: data.certifications || '',
          languages:      data.languages      || [],
          specialties:    data.specialties    || [],
          socialLinks: {
            instagram: data.socialLinks?.instagram || '',
            facebook:  data.socialLinks?.facebook  || '',
            website:   data.socialLinks?.website   || '',
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const setNested = (sec, f, v) => setForm(p => ({ ...p, [sec]: { ...p[sec], [f]: v } }));
  const toggleArr = (field, val) =>
    setForm(p => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter(x => x !== val) : [...p[field], val],
    }));
  const addCustom = (field, val, reset) => {
    const v = val.trim();
    if (!v || form[field].includes(v)) return;
    setForm(p => ({ ...p, [field]: [...p[field], v] }));
    reset('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await axios.put(`${API}/api/guides/profile`, {
        ...form,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : 0,
      }, auth());
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
        <h1 className="text-2xl font-extrabold">Edit Guide Profile</h1>
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
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Bio / About Me</label>
            <textarea rows={4} value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="Describe your experience, style, and what makes you a great guide..."
              className={`${inp} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">City / Location</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Varanasi, UP" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Phone <span className="text-gray-500 font-normal">(private)</span></label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX" className={inp} />
            </div>
          </div>
        </div>

        {/* Professional */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Professional Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Experience</label>
              <input type="text" value={form.experience} onChange={e => set('experience', e.target.value)}
                placeholder="e.g. 5 years" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Price Per Hour ($)</label>
              <input type="number" min="0" value={form.pricePerHour} onChange={e => set('pricePerHour', e.target.value)}
                placeholder="e.g. 25" className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Availability</label>
            <div className="flex gap-2 flex-wrap">
              {['Weekdays','Weekends','Full-time','Anytime','On Request'].map(a => (
                <button key={a} type="button"
                  onClick={() => set('availability', form.availability === a ? '' : a)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    form.availability === a
                      ? 'bg-green-900/40 border-green-600 text-green-300'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-green-500/40'
                  }`}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Certifications</label>
            <input type="text" value={form.certifications} onChange={e => set('certifications', e.target.value)}
              placeholder="e.g. Govt. Licensed Tourist Guide, First Aid" className={inp} />
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Languages Spoken</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {LANG_OPTS.map(l => (
              <button key={l} type="button" onClick={() => toggleArr('languages', l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.languages.includes(l)
                    ? 'bg-cyan-900/40 border-cyan-600 text-cyan-300'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-cyan-500/40'
                }`}>{l}</button>
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
            <button type="button" onClick={() => addCustom('languages', customLang, setCustomLang)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold px-4 rounded-xl text-sm transition-all">+</button>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Tour Specialties</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {SPECIALTY_OPTS.map(s => (
              <button key={s} type="button" onClick={() => toggleArr('specialties', s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.specialties.includes(s)
                    ? 'bg-yellow-900/40 border-yellow-600 text-yellow-300'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-yellow-500/40'
                }`}>{s}</button>
            ))}
            {form.specialties.filter(s => !SPECIALTY_OPTS.includes(s)).map(s => (
              <button key={s} type="button" onClick={() => toggleArr('specialties', s)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-yellow-900/40 border-yellow-600 text-yellow-300">
                {s} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customSpec} onChange={e => setCustomSpec(e.target.value)}
              placeholder="Add specialty..." className={`${inp} flex-grow`} />
            <button type="button" onClick={() => addCustom('specialties', customSpec, setCustomSpec)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold px-4 rounded-xl text-sm transition-all">+</button>
          </div>
        </div>

        {/* Social */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Social Links</p>
          {[
            { key: 'instagram', label: '📸 Instagram handle', placeholder: 'your_handle' },
            { key: 'facebook',  label: '💙 Facebook URL',     placeholder: 'https://facebook.com/...' },
            { key: 'website',   label: '🌐 Website',          placeholder: 'https://yoursite.com' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">{label}</label>
              <input type="text" value={form.socialLinks[key]}
                onChange={e => setNested('socialLinks', key, e.target.value)}
                placeholder={placeholder} className={inp} />
            </div>
          ))}
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

export default EditProfile;