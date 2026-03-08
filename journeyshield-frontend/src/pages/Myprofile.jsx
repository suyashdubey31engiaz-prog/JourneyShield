import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME   || '';
const UPLOAD_PRESET= import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};
const initials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

// ── Tag pill ──────────────────────────────────────────────────────────────────
const Tag = ({ label, color = 'gray' }) => {
  const c = {
    gray:   'bg-gray-700/60 text-gray-300 border-gray-600/50',
    yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
    cyan:   'bg-cyan-900/30  text-cyan-400  border-cyan-700/40',
    green:  'bg-green-900/30 text-green-400 border-green-700/40',
    pink:   'bg-pink-900/30  text-pink-400  border-pink-700/40',
  }[color] || 'bg-gray-700/60 text-gray-300 border-gray-600/50';
  return <span className={`inline-block text-[11px] font-semibold border rounded-full px-2.5 py-0.5 ${c}`}>{label}</span>;
};

const Section = ({ title, children }) => (
  <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">{title}</p>
    {children}
  </div>
);

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

// ══════════════════════════════════════════════════════════════════════════════
// IMAGE CROP MODAL  — pure Canvas, no library needed
// ══════════════════════════════════════════════════════════════════════════════
const CropModal = ({ imageSrc, onConfirm, onCancel }) => {
  const canvasRef   = useRef(null);
  const imgRef      = useRef(new Image());
  const stateRef    = useRef({ x: 0, y: 0, scale: 1, dragging: false, lastX: 0, lastY: 0 });
  const [scale, setScale]       = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');

  const SIZE = 320; // canvas px

  // Draw loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const img  = imgRef.current;
    const s    = stateRef.current;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Draw image
    const w = img.naturalWidth  * s.scale;
    const h = img.naturalHeight * s.scale;
    ctx.drawImage(img, s.x, s.y, w, h);

    // Dim outside circle
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Cut circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(SIZE/2, SIZE/2, SIZE/2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Circle border
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(SIZE/2, SIZE/2, SIZE/2 - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, []);

  // Load image, center it
  useEffect(() => {
    const img = imgRef.current;
    img.onload = () => {
      const s = stateRef.current;
      // Fit image to fill the circle initially
      const fit = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
      s.scale = fit;
      s.x = (SIZE - img.naturalWidth  * fit) / 2;
      s.y = (SIZE - img.naturalHeight * fit) / 2;
      setScale(fit);
      draw();
    };
    img.src = imageSrc;
  }, [imageSrc, draw]);

  // Redraw when scale slider changes
  useEffect(() => { draw(); }, [scale, draw]);

  // Mouse events
  const onMouseDown = (e) => {
    const s = stateRef.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  };
  const onMouseMove = (e) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    s.x += e.clientX - s.lastX;
    s.y += e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    draw();
  };
  const onMouseUp = () => { stateRef.current.dragging = false; };

  // Touch events
  const touchRef = useRef({});
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      stateRef.current.dragging = true;
    }
  };
  const onTouchMove = (e) => {
    const s = stateRef.current;
    if (e.touches.length === 1 && s.dragging) {
      s.x += e.touches[0].clientX - touchRef.current.x;
      s.y += e.touches[0].clientY - touchRef.current.y;
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      draw();
    }
  };
  const onTouchEnd = () => { stateRef.current.dragging = false; };

  // Scroll to zoom — must be added via useEffect with passive:false
  // React's synthetic onWheel is passive and cannot call preventDefault()
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const s   = stateRef.current;
    const img = imgRef.current;
    const minScale = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
    const newScale = Math.min(5, Math.max(minScale, s.scale - e.deltaY * 0.002));
    const cx = SIZE / 2, cy = SIZE / 2;
    s.x = cx - (cx - s.x) * (newScale / s.scale);
    s.y = cy - (cy - s.y) * (newScale / s.scale);
    s.scale = newScale;
    setScale(newScale);
    draw();
  }, [draw]);

  // Attach wheel listener as non-passive so preventDefault works
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const handleSlider = (e) => {
    const s   = stateRef.current;
    const img = imgRef.current;
    const newScale = Number(e.target.value);
    const cx = SIZE / 2, cy = SIZE / 2;
    s.x = cx - (cx - s.x) * (newScale / s.scale);
    s.y = cy - (cy - s.y) * (newScale / s.scale);
    s.scale = newScale;
    setScale(newScale);
    draw();
  };

  // Export cropped circle → blob → upload
  const handleConfirm = async () => {
    setError('');
    setUploading(true);
    try {
      // Draw final cropped circle onto an offscreen canvas
      const out = document.createElement('canvas');
      out.width = out.height = 400;
      const ctx = out.getContext('2d');
      const s   = stateRef.current;
      const img = imgRef.current;
      const ratio = 400 / SIZE;

      // Clip to circle
      ctx.beginPath();
      ctx.arc(200, 200, 200, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(img, s.x * ratio, s.y * ratio, img.naturalWidth * s.scale * ratio, img.naturalHeight * s.scale * ratio);

      out.toBlob(async (blob) => {
        try {
          if (!CLOUD_NAME || !UPLOAD_PRESET) {
            throw new Error('Cloudinary env vars missing in frontend .env');
          }
          const fd = new FormData();
          fd.append('file', blob, 'avatar.jpg');
          fd.append('upload_preset', UPLOAD_PRESET);

          const { data } = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, fd
          );
          onConfirm(data.secure_url);
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.message || 'Upload failed';
          setError(msg);
          setUploading(false);
        }
      }, 'image/jpeg', 0.92);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const minScale = imgRef.current.naturalWidth
    ? Math.max(SIZE / imgRef.current.naturalWidth, SIZE / imgRef.current.naturalHeight)
    : 0.1;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-extrabold text-lg">Adjust Profile Photo</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white text-xl transition-all">✕</button>
        </div>

        {/* Canvas */}
        <div className="rounded-2xl overflow-hidden border border-gray-700 cursor-grab active:cursor-grabbing touch-none mx-auto"
          style={{ width: SIZE, height: SIZE }}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ display: 'block' }}
          />
        </div>

        {/* Instructions */}
        <p className="text-gray-500 text-xs text-center mt-2 mb-4">
          Drag to reposition · Scroll or slider to zoom
        </p>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="range"
            min={minScale || 0.1}
            max={5}
            step={0.01}
            value={scale}
            onChange={handleSlider}
            className="w-full accent-yellow-500 cursor-pointer"
          />
          <span className="text-gray-400 text-sm">🔎</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-xs font-semibold">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={uploading}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={uploading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            {uploading
              ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading…</>
              : '✅ Save Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// AVATAR BUTTON — opens file picker → crop modal
// ══════════════════════════════════════════════════════════════════════════════
const AvatarWithCrop = ({ src, name, onSave, editable = false }) => {
  const fileRef  = useRef();
  const [rawSrc, setRawSrc]   = useState(null);  // raw file URL for crop modal
  const [saving, setSaving]   = useState(false);
  const [msg,    setMsg]      = useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setMsg('Max 10 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setRawSrc(ev.target.result);
    reader.readAsDataURL(file);
    // Reset input so same file can be picked again
    e.target.value = '';
  };

  const handleCropConfirm = async (url) => {
    setSaving(true);
    setRawSrc(null);
    try {
      await onSave(url);
      setMsg('✅ Photo updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(`❌ ${err.message || 'Failed to save.'}`);
    } finally { setSaving(false); }
  };

  return (
    <>
      {rawSrc && (
        <CropModal
          imageSrc={rawSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setRawSrc(null)}
        />
      )}

      <div className="relative w-fit mx-auto">
        <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-gray-600 shadow-xl ring-2 ring-gray-700">
          {src
            ? <img src={src} alt={name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-amber-800 flex items-center justify-center text-3xl font-extrabold text-white">
                {initials(name)}
              </div>
          }
          {saving && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
              <svg className="animate-spin w-6 h-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          )}
        </div>

        {editable && (
          <button
            onClick={() => fileRef.current.click()}
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-yellow-500 hover:bg-yellow-400 border-2 border-gray-900 flex items-center justify-center text-black shadow-lg transition-all text-base"
            title="Change photo">
            📷
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {msg && <p className={`text-center text-xs font-bold mt-2 ${msg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const MyProfile = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(sessionStorage.getItem('user'));
  const isGuide  = user?.role === 'Guide';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const endpoint = isGuide ? `${API}/api/guides/me` : `${API}/api/users/me`;
    axios.get(endpoint, auth())
      .then(({ data }) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Save avatar URL to DB + sessionStorage
  const handleAvatarSave = async (url) => {
    try {
      if (isGuide) {
        // Save to Guide profile (has its own avatar field)
        await axios.put(`${API}/api/guides/profile`, { avatar: url }, auth());
        // Also save to User model so Navbar shows it immediately
        await axios.put(`${API}/api/users/me`, { avatar: url }, auth());
      } else {
        await axios.put(`${API}/api/users/me`, { avatar: url }, auth());
      }
      // Sync sessionStorage so Navbar avatar updates instantly
      const stored = JSON.parse(sessionStorage.getItem('user'));
      stored.avatar = url;
      sessionStorage.setItem('user', JSON.stringify(stored));
      setProfile(p => ({ ...p, avatar: url, userAvatar: url }));
    } catch (err) {
      // Surface the real backend error message
      const msg = err.response?.data?.message || err.message || 'Save failed';
      console.error('[Avatar save error]', msg, err.response?.data);
      throw new Error(msg);
    }
  };

  const editPath = isGuide ? '/edit-profile' : '/edit-traveler-profile';

  if (loading) return (
    <div className="container mx-auto px-6 py-10 max-w-2xl space-y-4">
      <div className="w-28 h-28 bg-gray-800 animate-pulse rounded-full mx-auto mb-6" />
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-800 animate-pulse rounded-2xl" />)}
    </div>
  );

  if (!profile) return <div className="text-center py-20 text-gray-400">Could not load profile.</div>;

  // ── GUIDE view ──────────────────────────────────────────────────────────────
  if (isGuide) {
    const gp = profile;
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl text-white">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold">My Profile</h1>
          <button onClick={() => navigate(editPath)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
            ✏️ Edit Profile
          </button>
        </div>

        <div className="text-center mb-8">
          <AvatarWithCrop
            src={gp.avatar || gp.userAvatar}
            name={gp.userName || user?.name}
            onSave={handleAvatarSave}
            editable
          />
          <h2 className="text-2xl font-extrabold mt-4">{gp.userName || user?.name}</h2>
          <p className="text-gray-400 text-sm">{gp.userEmail || user?.email}</p>
          {gp.location && <p className="text-yellow-400 text-sm font-semibold mt-1">📍 {gp.location}</p>}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-sm ${s <= Math.round(gp.rating||0) ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
              ))}
            </div>
            <span className="text-yellow-400 font-bold text-sm">{gp.rating > 0 ? Number(gp.rating).toFixed(1) : '—'}</span>
            <span className="text-gray-500 text-sm">({gp.reviews || 0} reviews)</span>
          </div>
        </div>

        <div className="space-y-4">
          {gp.bio && (
            <Section title="About Me">
              <p className="text-gray-300 text-sm leading-relaxed">{gp.bio}</p>
            </Section>
          )}

          <Section title="Professional Details">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon="💰" label="Rate"          value={gp.pricePerHour ? `₹${gp.pricePerHour}/hr` : null} />
              <InfoRow icon="🏅" label="Experience"    value={gp.experience}  />
              <InfoRow icon="⏰" label="Availability"  value={gp.availability}/>
              <InfoRow icon="📜" label="Certifications"value={gp.certifications}/>
              <InfoRow icon="📞" label="Phone"         value={gp.phone}/>
            </div>
          </Section>

          {(gp.languages?.length > 0 || gp.specialties?.length > 0) && (
            <Section title="Skills">
              {gp.languages?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1.5">🗣️ Languages</p>
                  <div className="flex flex-wrap gap-1.5">{gp.languages.map(l => <Tag key={l} label={l} color="cyan" />)}</div>
                </div>
              )}
              {gp.specialties?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">🎯 Specialties</p>
                  <div className="flex flex-wrap gap-1.5">{gp.specialties.map(s => <Tag key={s} label={s} color="yellow" />)}</div>
                </div>
              )}
            </Section>
          )}

          {(gp.socialLinks?.instagram || gp.socialLinks?.facebook || gp.socialLinks?.website) && (
            <Section title="Links">
              <div className="flex flex-wrap gap-3">
                {gp.socialLinks?.instagram && <a href={`https://instagram.com/${gp.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="text-sm text-pink-400 hover:text-pink-300 underline">📸 Instagram</a>}
                {gp.socialLinks?.facebook  && <a href={gp.socialLinks.facebook}  target="_blank" rel="noreferrer" className="text-sm text-blue-400  hover:text-blue-300  underline">💙 Facebook</a>}
                {gp.socialLinks?.website   && <a href={gp.socialLinks.website}   target="_blank" rel="noreferrer" className="text-sm text-green-400 hover:text-green-300 underline">🌐 Website</a>}
              </div>
            </Section>
          )}

          {(!gp.bio || !gp.experience || !gp.pricePerHour) && (
            <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-2xl p-4">
              <p className="text-yellow-400 font-bold text-sm mb-1">💡 Complete your profile</p>
              <p className="text-gray-400 text-xs">Add your bio, price, and experience to attract more travelers.</p>
              <button onClick={() => navigate(editPath)} className="mt-2 text-xs font-bold text-yellow-400 underline">Go to Edit →</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TRAVELER view ───────────────────────────────────────────────────────────
  const p = profile;
  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold">My Profile</h1>
        <button onClick={() => navigate(editPath)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
          ✏️ Edit Profile
        </button>
      </div>

      <div className="text-center mb-8">
        <AvatarWithCrop src={p.avatar} name={p.name} onSave={handleAvatarSave} editable />
        <h2 className="text-2xl font-extrabold mt-4">{p.name}</h2>
        <p className="text-gray-400 text-sm">@{p.username} · {p.email}</p>
        {p.homeCity && <p className="text-yellow-400 text-sm font-semibold mt-1">📍 {p.homeCity}</p>}
        {p.travelStyle && <div className="mt-2"><Tag label={`✈️ ${p.travelStyle}`} color="yellow" /></div>}
      </div>

      <div className="space-y-4">
        {p.bio && (
          <Section title="About Me">
            <p className="text-gray-300 text-sm leading-relaxed">{p.bio}</p>
          </Section>
        )}

        {(p.languages?.length > 0 || p.interests?.length > 0) && (
          <Section title="Interests & Languages">
            {p.languages?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1.5">🗣️ Languages</p>
                <div className="flex flex-wrap gap-1.5">{p.languages.map(l => <Tag key={l} label={l} color="cyan" />)}</div>
              </div>
            )}
            {p.interests?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">🎯 Interests</p>
                <div className="flex flex-wrap gap-1.5">{p.interests.map(i => <Tag key={i} label={i} color="pink" />)}</div>
              </div>
            )}
          </Section>
        )}

        <Section title="Private Details (only you can see this)">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon="📞" label="Phone"   value={p.phone} />
            <InfoRow icon="🔒" label="Member since" value={new Date(p.createdAt).getFullYear().toString()} />
          </div>
        </Section>

        {(p.emergencyContact?.name || p.emergencyContact?.phone) && (
          <Section title="🆘 Emergency Contact (private)">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon="👤" label="Name"     value={p.emergencyContact.name}     />
              <InfoRow icon="📞" label="Phone"    value={p.emergencyContact.phone}    />
              <InfoRow icon="🤝" label="Relation" value={p.emergencyContact.relation} />
            </div>
          </Section>
        )}

        {(p.socialLinks?.instagram || p.socialLinks?.website) && (
          <Section title="Links">
            <div className="flex flex-wrap gap-3">
              {p.socialLinks?.instagram && <a href={`https://instagram.com/${p.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="text-sm text-pink-400 hover:text-pink-300 underline">📸 Instagram</a>}
              {p.socialLinks?.website   && <a href={p.socialLinks.website}   target="_blank" rel="noreferrer" className="text-sm text-green-400 hover:text-green-300 underline">🌐 Website</a>}
            </div>
          </Section>
        )}

        <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">🔐</span>
          <div>
            <p className="text-white font-bold text-sm mb-1">Privacy Note</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Your phone and emergency contact are never shared with guides.
              A future chat module will let guides request access — full details only unlock after both parties approve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;