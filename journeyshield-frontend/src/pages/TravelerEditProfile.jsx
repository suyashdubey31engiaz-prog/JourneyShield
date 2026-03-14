import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/common/Toast';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};

const TRAVEL_STYLES = ['Adventure', 'Cultural', 'Leisure', 'Budget', 'Luxury', 'Solo', 'Family'];
const INTEREST_OPTS = ['Temples', 'Museums', 'Mountains', 'Beaches', 'Food', 'Photography', 'History', 'Wildlife', 'Shopping', 'Nightlife', 'Architecture', 'Festivals'];
const LANG_OPTS     = ['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Gujarati', 'Punjabi', 'French', 'Spanish', 'German', 'Japanese'];

// Mandatory fields for Traveler profile
const MANDATORY = ['homeCity', 'phone', 'travelStyle', 'ec_name', 'ec_phone', 'ec_relation'];

const inp = (err) =>
  `w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:ring-1 outline-none transition-all ${
    err ? 'border-red-500 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-700 focus:border-yellow-500 focus:ring-yellow-500/20'
  }`;

const TravelerEditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: '', homeCity: '', phone: '', travelStyle: '',
    interests: [], languages: [],
    emergencyContact: { name: '', phone: '', relation: '' },
    socialLinks: { instagram: '', website: '' },
  });
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [errors,         setErrors]         = useState({});
  const [toast,          setToast]          = useState(null);
  const [errMsg,         setErrMsg]         = useState('');
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

  const set = (field, val) => { setForm(f => ({ ...f, [field]: val })); setErrors(e => ({ ...e, [field]: false })); };
  const setNested = (section, field, val) => {
    setForm(f => ({ ...f, [section]: { ...f[section], [field]: val } }));
    setErrors(e => ({ ...e, [`ec_${field}`]: false }));
  };
  const toggleArr = (field, val) => {
    setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val] }));
    setErrors(e => ({ ...e, [field]: false }));
  };
  const addCustom = (field, val, reset) => {
    const v = val.trim();
    if (!v || form[field].includes(v)) return;
    setForm(f => ({ ...f, [field]: [...f[field], v] }));
    reset('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.homeCity?.trim())                     newErrors.homeCity    = true;
    if (!form.phone?.trim())                        newErrors.phone       = true;
    if (!form.travelStyle?.trim())                  newErrors.travelStyle = true;
    if (!form.emergencyContact.name?.trim())        newErrors.ec_name     = true;
    if (!form.emergencyContact.phone?.trim())       newErrors.ec_phone    = true;
    if (!form.emergencyContact.relation?.trim())    newErrors.ec_relation = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // prevent double submit
    setErrMsg('');
    if (!validate()) {
      setErrMsg('Please fill in all mandatory fields highlighted in red.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${API}/api/users/me`, form, auth());
      setToast({ message: '✅ Traveler profile saved successfully!', type: 'success' });
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setErrMsg(err.response?.data?.message || '❌ Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-2xl space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-800 animate-pulse rounded-2xl" />)}
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl text-white animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
          ←
        </button>
        <h1 className="text-2xl font-extrabold">Edit Traveler Profile</h1>
      </div>

      {/* Mandatory notice */}
      <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-yellow-900/20 border border-yellow-800/40 text-yellow-400">
        Fields marked with <span className="text-red-400 font-bold">*</span> are mandatory to complete your profile.
      </div>

      {errMsg && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-bold bg-red-900/20 text-red-400 border border-red-800/40">
          {errMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Basic Info</p>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">
              Bio <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="Tell guides a bit about yourself..."
              className={`${inp(false)} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">
                Home City <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.homeCity} onChange={e => set('homeCity', e.target.value)}
                placeholder="e.g. Mumbai" className={inp(errors.homeCity)} />
              {errors.homeCity && <p className="text-red-400 text-xs mt-1">Home city is required</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">
                Phone <span className="text-red-400">*</span> <span className="text-gray-500 font-normal">(private)</span>
              </label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX" className={inp(errors.phone)} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">Phone is required</p>}
            </div>
          </div>
        </div>

        {/* Travel style */}
        <div className={`bg-gray-800/60 border rounded-2xl p-5 ${errors.travelStyle ? 'border-red-500' : 'border-gray-700'}`}>
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">
            Travel Style <span className="text-red-400">*</span>
          </p>
          {errors.travelStyle && <p className="text-red-400 text-xs mb-2">Please select a travel style</p>}
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map(s => (
              <button key={s} type="button"
                onClick={() => set('travelStyle', form.travelStyle === s ? '' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.travelStyle === s
                    ? 'bg-yellow-500 border-yellow-500 text-black'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-yellow-500/40'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            Interests <span className="text-gray-500 font-normal normal-case">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {INTEREST_OPTS.map(i => (
              <button key={i} type="button" onClick={() => toggleArr('interests', i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.interests.includes(i)
                    ? 'bg-pink-900/40 border-pink-600 text-pink-300'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-pink-500/40'
                }`}>{i}</button>
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
              placeholder="Add custom..." className={`${inp(false)} flex-grow`} />
            <button type="button" onClick={() => addCustom('interests', customInterest, setCustomInterest)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold px-4 rounded-xl text-sm transition-all">+</button>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            Languages Spoken <span className="text-gray-500 font-normal normal-case">(optional)</span>
          </p>
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
              placeholder="Add language..." className={`${inp(false)} flex-grow`} />
            <button type="button" onClick={() => addCustom('languages', customLang, setCustomLang)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold px-4 rounded-xl text-sm transition-all">+</button>
          </div>
        </div>

        {/* Emergency contact */}
        <div className={`bg-gray-800/60 border rounded-2xl p-5 space-y-4 ${
          (errors.ec_name || errors.ec_phone || errors.ec_relation) ? 'border-red-500' : 'border-gray-700'
        }`}>
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
            🆘 Emergency Contact <span className="text-red-400">*</span> <span className="text-gray-600 font-normal normal-case">(private — never shared)</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.emergencyContact.name}
                onChange={e => setNested('emergencyContact', 'name', e.target.value)}
                placeholder="Contact's name" className={inp(errors.ec_name)} />
              {errors.ec_name && <p className="text-red-400 text-xs mt-1">Name is required</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Phone <span className="text-red-400">*</span></label>
              <input type="tel" value={form.emergencyContact.phone}
                onChange={e => setNested('emergencyContact', 'phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX" className={inp(errors.ec_phone)} />
              {errors.ec_phone && <p className="text-red-400 text-xs mt-1">Phone is required</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-300 mb-1.5">Relation <span className="text-red-400">*</span></label>
              <input type="text" value={form.emergencyContact.relation}
                onChange={e => setNested('emergencyContact', 'relation', e.target.value)}
                placeholder="e.g. Parent, Sibling, Friend" className={inp(errors.ec_relation)} />
              {errors.ec_relation && <p className="text-red-400 text-xs mt-1">Relation is required</p>}
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
            Social Links <span className="text-gray-500 font-normal normal-case">(optional)</span>
          </p>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Instagram handle</label>
            <input type="text" value={form.socialLinks.instagram}
              onChange={e => setNested('socialLinks', 'instagram', e.target.value)}
              placeholder="your_handle" className={inp(false)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">Website</label>
            <input type="url" value={form.socialLinks.website}
              onChange={e => setNested('socialLinks', 'website', e.target.value)}
              placeholder="https://yoursite.com" className={inp(false)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/profile')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
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