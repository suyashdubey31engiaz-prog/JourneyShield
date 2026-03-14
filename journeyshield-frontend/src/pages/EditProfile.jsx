import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/common/Toast';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};

const LANG_OPTS      = ['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Gujarati', 'Punjabi', 'French', 'Spanish', 'German', 'Japanese'];
const SPECIALTY_OPTS = ['Religious Tours', 'Historical Sites', 'Wildlife', 'Trekking', 'Food Tours', 'Photography', 'City Tours', 'River Trips', 'Architecture', 'Cultural Shows'];

// Mandatory fields for Guide profile
const MANDATORY = ['bio', 'location', 'phone', 'experience', 'pricePerHour', 'availability', 'languages'];

const inp = (err) =>
  `w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:ring-1 outline-none transition-all ${
    err ? 'border-red-500 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-700 focus:border-yellow-500 focus:ring-yellow-500/20'
  }`;

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bio: '', location: '', experience: '', phone: '',
    availability: '', pricePerHour: '',
    certifications: '', languages: [], specialties: [],
    socialLinks: { instagram: '', facebook: '', website: '' },
  });
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});
  const [toast,       setToast]       = useState(null);
  const [errMsg,      setErrMsg]      = useState('');
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

  const set       = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: false })); };
  const setNested = (sec, f, v) => setForm(p => ({ ...p, [sec]: { ...p[sec], [f]: v } }));
  const toggleArr = (field, val) => {
    setForm(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(x => x !== val) : [...p[field], val] }));
    setErrors(e => ({ ...e, [field]: false }));
  };
  const addCustom = (field, val, reset) => {
    const v = val.trim();
    if (!v || form[field].includes(v)) return;
    setForm(p => ({ ...p, [field]: [...p[field], v] }));
    setErrors(e => ({ ...e, [field]: false }));
    reset('');
  };

  const validate = () => {
    const newErrors = {};
    MANDATORY.forEach(f => {
      const val = form[f];
      if (Array.isArray(val) ? val.length === 0 : !val || !String(val).trim()) {
        newErrors[f] = true;
      }
    });
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
      await axios.put(`${API}/api/guides/profile`, {
        ...form,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : 0,
      }, auth());
      setToast({ message: '✅ Guide profile saved successfully!', type: 'success' });
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
        <h1 className="text-2xl font-extrabold">Edit Guide Profile</h1>
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
              Bio / About Me <span className="text-red-400">*</span>
            </label>
            <textarea rows={4} value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="Describe your experience, style, and what makes you a great guide..."
              className={`${inp(errors.bio)} resize-none`} />
            {errors.bio && <p className="text-red-400 text-xs mt-1">Bio is required</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">
                City / Location <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Varanasi, UP" className={inp(errors.location)} />
              {errors.location && <p className="text-red-400 text-xs mt-1">Location is required</p>}
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

        {/* Professional */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Professional Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">
                Experience <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.experience} onChange={e => set('experience', e.target.value)}
                placeholder="e.g. 5 years" className={inp(errors.experience)} />
              {errors.experience && <p className="text-red-400 text-xs mt-1">Experience is required</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">
                Price Per Hour ($) <span className="text-red-400">*</span>
              </label>
              <input type="number" min="0" value={form.pricePerHour} onChange={e => set('pricePerHour', e.target.value)}
                placeholder="e.g. 25" className={inp(errors.pricePerHour)} />
              {errors.pricePerHour && <p className="text-red-400 text-xs mt-1">Price is required</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">
              Availability <span className="text-red-400">*</span>
            </label>
            <div className={`flex gap-2 flex-wrap p-2 rounded-xl ${errors.availability ? 'border border-red-500' : ''}`}>
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
            {errors.availability && <p className="text-red-400 text-xs mt-1">Please select your availability</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">
              Certifications <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input type="text" value={form.certifications} onChange={e => set('certifications', e.target.value)}
              placeholder="e.g. Govt. Licensed Tourist Guide, First Aid" className={inp(false)} />
          </div>
        </div>

        {/* Languages */}
        <div className={`bg-gray-800/60 border rounded-2xl p-5 ${errors.languages ? 'border-red-500' : 'border-gray-700'}`}>
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">
            Languages Spoken <span className="text-red-400">*</span>
          </p>
          {errors.languages && <p className="text-red-400 text-xs mb-2">Select at least one language</p>}
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

        {/* Specialties */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            Tour Specialties <span className="text-gray-500 font-normal normal-case">(optional)</span>
          </p>
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
              placeholder="Add specialty..." className={`${inp(false)} flex-grow`} />
            <button type="button" onClick={() => addCustom('specialties', customSpec, setCustomSpec)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-bold px-4 rounded-xl text-sm transition-all">+</button>
          </div>
        </div>

        {/* Social */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
            Social Links <span className="text-gray-500 font-normal normal-case">(optional)</span>
          </p>
          {[
            { key: 'instagram', label: '📸 Instagram handle', placeholder: 'your_handle' },
            { key: 'facebook',  label: '💙 Facebook URL',     placeholder: 'https://facebook.com/...' },
            { key: 'website',   label: '🌐 Website',          placeholder: 'https://yoursite.com' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">{label}</label>
              <input type="text" value={form.socialLinks[key]}
                onChange={e => setNested('socialLinks', key, e.target.value)}
                placeholder={placeholder} className={inp(false)} />
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

export default EditProfile;