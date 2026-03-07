import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Tooltip,
  Polyline, useMap, CircleMarker, Popup, Circle,
} from 'react-leaflet';
import L from 'leaflet';
import searchService   from '../services/searchService';
import incidentService from '../services/incidentService';

// ── Leaflet default icon fix ──────────────────────────────────────────────────
import iconUrl       from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({
  iconUrl, shadowUrl: iconShadowUrl, iconSize: [25, 41], iconAnchor: [12, 41],
});

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all',         label: 'All Places',   emoji: '🗺️', color: '#6b7280' },
  { key: 'attractions', label: 'Attractions',  emoji: '🎯', color: '#f59e0b' },
  { key: 'restaurants', label: 'Food & Drink', emoji: '🍽️', color: '#ef4444' },
  { key: 'hotels',      label: 'Hotels',       emoji: '🏨', color: '#8b5cf6' },
  { key: 'museums',     label: 'Museums',      emoji: '🏛️', color: '#3b82f6' },
  { key: 'parks',       label: 'Parks',        emoji: '🌳', color: '#22c55e' },
  { key: 'shopping',    label: 'Shopping',     emoji: '🛍️', color: '#ec4899' },
  { key: 'cafes',       label: 'Cafes',        emoji: '☕', color: '#a16207' },
  { key: 'hospitals',   label: 'Medical',      emoji: '🏥', color: '#06b6d4' },
];

const getCatCfg = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

const catForResult = (r) => {
  const c = (r.category || '').toLowerCase();
  if (c.includes('restaurant') || c.includes('food') || c.includes('eat')) return 'restaurants';
  if (c.includes('hotel') || c.includes('accommodat') || c.includes('lodge')) return 'hotels';
  if (c.includes('museum')) return 'museums';
  if (c.includes('park') || c.includes('garden') || c.includes('nature')) return 'parks';
  if (c.includes('shop') || c.includes('mall') || c.includes('market')) return 'shopping';
  if (c.includes('cafe') || c.includes('coffee') || c.includes('tea')) return 'cafes';
  if (c.includes('hospital') || c.includes('clinic') || c.includes('medical')) return 'hospitals';
  return 'attractions';
};

// ── Custom DivIcons ───────────────────────────────────────────────────────────
const makePlaceIcon = (catKey, selected = false) => {
  const cfg  = getCatCfg(catKey);
  const bg   = selected ? '#f59e0b' : cfg.color;
  const size = selected ? 38 : 30;
  return L.divIcon({
    className: '',
    html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${selected?17:13}px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.5)">${cfg.emoji}</div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size/2],
  });
};

const makeUserIcon = () => L.divIcon({
  className: '',
  html: '<div style="background:#22c55e;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(34,197,94,.3)"></div>',
  iconSize: [18,18], iconAnchor: [9,9],
});

const makeSearchCenterIcon = () => L.divIcon({
  className: '',
  html: '<div style="background:#f59e0b;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 3px rgba(245,158,11,.4)"></div>',
  iconSize: [12,12], iconAnchor: [6,6],
});

const incidentColor = s =>
  ({Critical:'#ef4444',High:'#f97316',Medium:'#eab308',Low:'#3b82f6'}[s]||'#ef4444');

const fmtDist = m => !m && m!==0 ? '' : m>=1000 ? `${(m/1000).toFixed(1)} km` : `${m} m`;

// ── MapFlyTo ──────────────────────────────────────────────────────────────────
const MapFlyTo = ({ target }) => {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!target || target === prev.current) return;
    prev.current = target;
    if (Array.isArray(target[0]) && Array.isArray(target[0])) {
      map.flyToBounds(L.latLngBounds(target), { padding: [70, 70], duration: 1 });
    } else {
      map.flyTo(target, 14, { duration: 1 });
    }
  }, [target, map]);
  return null;
};

// ── Place card ────────────────────────────────────────────────────────────────
const PlaceCard = ({ place, selected, onSelect, onRoute }) => {
  const cat = getCatCfg(catForResult(place));
  return (
    <div
      onClick={() => onSelect(place)}
      className={`rounded-2xl border cursor-pointer transition-all ${
        selected
          ? 'border-yellow-600/70 shadow-lg shadow-yellow-900/20'
          : 'bg-gray-800/60 border-gray-700 hover:border-gray-600 hover:-translate-y-0.5'
      }`}
      style={selected ? { background: cat.color + '15', borderColor: cat.color + 'aa' } : {}}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-white/10"
            style={{ background: cat.color + '28' }}>
            {cat.emoji}
          </div>
          <div className="min-w-0 flex-grow">
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">{place.name}</h3>
            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{place.address || place.city || '—'}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ color: cat.color, borderColor: cat.color+'55', background: cat.color+'18' }}>
                {cat.label}
              </span>
              {place.distance != null && (
                <span className="text-[11px] text-gray-500">📍 {fmtDist(place.distance)}</span>
              )}
            </div>
          </div>
        </div>

        {selected && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
            {place.phone && <p className="text-xs text-gray-400">📞 {place.phone}</p>}
            {place.website && (
              <a href={place.website} target="_blank" rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline block truncate"
                onClick={e => e.stopPropagation()}>
                🌐 {place.website.replace(/^https?:\/\//,'')}
              </a>
            )}
            <button
              onClick={e => { e.stopPropagation(); onRoute(place); }}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-xl text-xs transition-all">
              🗺️ Get Directions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Discover = () => {
  const [userLocation,   setUserLocation]   = useState(null);
  const [searchedCenter, setSearchedCenter] = useState(null);
  const [flyTarget,      setFlyTarget]      = useState(null);
  const [locationQuery,  setLocationQuery]  = useState('');
  const [poiQuery,       setPoiQuery]       = useState('');
  const [category,       setCategory]       = useState('all');
  const [radius,         setRadius]         = useState(5000);
  const [places,         setPlaces]         = useState([]);
  const [selectedPlace,  setSelectedPlace]  = useState(null);
  const [route,          setRoute]          = useState([]);
  const [incidents,      setIncidents]      = useState([]);
  const [loadingGeo,     setLoadingGeo]     = useState(false);
  const [loadingPOI,     setLoadingPOI]     = useState(false);
  const [loadingRoute,   setLoadingRoute]   = useState(false);
  const [geoError,       setGeoError]       = useState('');
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [activeTab,      setActiveTab]      = useState('places');
  const [showRadius,     setShowRadius]     = useState(true);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = [coords.latitude, coords.longitude];
        setUserLocation(p);
        setFlyTarget(p);
      },
      () => {}
    );
  }, []);

  const fetchPOIs = useCallback(async (lat, lon) => {
    setLoadingPOI(true);
    setPlaces([]);
    setSelectedPlace(null);
    setRoute([]);
    try {
      const { data } = await searchService.searchNearbyPlaces(lat, lon, {
        query:    poiQuery.trim(),
        category: category === 'all' ? '' : category,
        radius,
      });
      setPlaces(data.results || []);
    } catch (err) {
      console.error('[Discover] POI error:', err.message);
    } finally {
      setLoadingPOI(false);
    }
  }, [poiQuery, category, radius]);

  const fetchIncidents = useCallback(async (lat, lon) => {
    try {
      const { data } = await incidentService.getNearbyIncidents(lat, lon, Math.ceil(radius/1000));
      setIncidents(data || []);
    } catch { /* non-fatal */ }
  }, [radius]);

  // Re-run when search center or filters change
  useEffect(() => {
    if (!searchedCenter) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPOIs(searchedCenter[0], searchedCenter[1]);
      fetchIncidents(searchedCenter[0], searchedCenter[1]);
    }, 300);
  }, [searchedCenter, fetchPOIs, fetchIncidents]);

  // Location geocode
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setGeoError('');
    setLoadingGeo(true);
    try {
      const { data } = await searchService.geocodeLocation(locationQuery.trim());
      const center = [data.lat, data.lon];
      setSearchedCenter(center);
      setFlyTarget(center);
    } catch (err) {
      setGeoError(
        err.response?.status === 404
          ? `"${locationQuery}" not found. Try a city name.`
          : 'Search failed. Check connection.'
      );
    } finally {
      setLoadingGeo(false);
    }
  };

  // Use GPS as center
  const handleNearMe = () => {
    if (!userLocation) return;
    setSearchedCenter([...userLocation]);
    setFlyTarget([...userLocation]);
  };

  // Route
  const handleRoute = async (place) => {
    if (!userLocation) { alert('Enable location to get directions.'); return; }
    setLoadingRoute(true);
    setRoute([]);
    try {
      const { data: pts } = await searchService.getRoute(
        userLocation[0], userLocation[1], place.lat, place.lon
      );
      setRoute(pts);
      if (pts.length > 1) setFlyTarget(pts);
    } catch { alert('Could not calculate route.'); }
    finally { setLoadingRoute(false); }
  };

  // Select/deselect
  const handleSelect = (place) => {
    if (selectedPlace?.id === place.id) {
      setSelectedPlace(null);
      setRoute([]);
    } else {
      setSelectedPlace(place);
      setFlyTarget([place.lat, place.lon]);
    }
  };

  const incSummary = incidents.reduce((a, i) => { a[i.severity]=(a[i.severity]||0)+1; return a; }, {});

  return (
    <div className="flex h-[calc(100vh-64px)] text-white overflow-hidden bg-gray-950">

      {/* ── SIDEBAR ── */}
      <div className={`flex flex-col bg-gray-900 border-r border-gray-700/50 transition-all duration-300 ${
        sidebarOpen ? 'w-[380px] min-w-[380px]' : 'w-0 min-w-0 overflow-hidden'
      }`}>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-700/50 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-extrabold text-white">Discover Places</h1>
              <p className="text-gray-500 text-xs mt-0.5">Explore & navigate safely</p>
            </div>
            {userLocation && (
              <button onClick={handleNearMe}
                className="text-xs font-bold text-green-400 border border-green-800/50 bg-green-900/20 px-3 py-1.5 rounded-xl hover:bg-green-900/40 transition-all whitespace-nowrap">
                📍 Near Me
              </button>
            )}
          </div>

          {/* Location bar */}
          <form onSubmit={handleLocationSearch} className="flex gap-2 mb-2.5">
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🌍</span>
              <input type="text" value={locationQuery} onChange={e=>setLocationQuery(e.target.value)}
                placeholder="City or area e.g. Varanasi"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all" />
            </div>
            <button type="submit" disabled={loadingGeo}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-extrabold px-4 rounded-xl text-sm transition-all shrink-0 flex items-center justify-center w-12">
              {loadingGeo
                ? <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : '→'}
            </button>
          </form>
          {geoError && <p className="text-red-400 text-xs mb-2">⚠️ {geoError}</p>}

          {/* POI keyword */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔍</span>
            <input type="text" value={poiQuery}
              onChange={e => setPoiQuery(e.target.value)}
              onKeyDown={e => e.key==='Enter' && searchedCenter && fetchPOIs(searchedCenter[0],searchedCenter[1])}
              placeholder="What to find? e.g. temples, cafes"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all" />
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all shrink-0 ${
                  category === cat.key
                    ? 'text-gray-900 border-transparent'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
                style={category === cat.key ? {background:cat.color,borderColor:cat.color} : {}}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Radius */}
        <div className="px-5 py-3 border-b border-gray-700/50 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-400">Search Radius</span>
            <span className="text-xs font-bold text-yellow-400">{fmtDist(radius)}</span>
          </div>
          <input type="range" min="500" max="20000" step="500" value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            className="w-full accent-yellow-500 cursor-pointer" />
          <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
            <span>500m</span><span>5km</span><span>10km</span><span>20km</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-3 gap-1 shrink-0">
          {[
            ['places',    `📍 Places${places.length ? ` (${places.length})` : ''}`],
            ['incidents', `⚠️ Safety${incidents.length ? ` (${incidents.length})` : ''}`],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 text-xs font-bold py-2 rounded-lg border transition-all ${
                activeTab === key
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
              }`}>{label}</button>
          ))}
        </div>

        {/* Scrollable list */}
        <div className="flex-grow overflow-y-auto px-5 py-3 space-y-2">

          {/* Places */}
          {activeTab === 'places' && (
            <>
              {!searchedCenter && !loadingPOI && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🗺️</p>
                  <p className="text-white font-bold mb-1">Enter a location above</p>
                  <p className="text-gray-500 text-xs">Type a city or tap "Near Me"</p>
                </div>
              )}
              {loadingPOI && [1,2,3,4,5].map(i => (
                <div key={i} className="h-20 bg-gray-800 animate-pulse rounded-2xl" />
              ))}
              {!loadingPOI && searchedCenter && places.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-3xl mb-3">🔎</p>
                  <p className="text-white font-bold mb-1">No places found</p>
                  <p className="text-gray-500 text-xs">Try increasing radius or a different category</p>
                </div>
              )}
              {!loadingPOI && places.map(p => (
                <PlaceCard key={p.id} place={p}
                  selected={selectedPlace?.id === p.id}
                  onSelect={handleSelect} onRoute={handleRoute} />
              ))}
            </>
          )}

          {/* Incidents */}
          {activeTab === 'incidents' && (
            <>
              {incidents.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-white font-bold mb-1">No incidents reported</p>
                  <p className="text-gray-500 text-xs">Area appears safe based on our data</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {['Critical','High','Medium','Low'].map(s => (
                      <div key={s} className="text-center rounded-xl p-2 border border-gray-700/50"
                        style={{ background: incidentColor(s)+'18' }}>
                        <p className="text-base font-extrabold" style={{color:incidentColor(s)}}>{incSummary[s]||0}</p>
                        <p className="text-[10px] text-gray-400">{s}</p>
                      </div>
                    ))}
                  </div>
                  {incidents.map(inc => (
                    <div key={inc._id}
                      className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex gap-3">
                      <div className="w-2.5 rounded-full shrink-0 mt-1 min-h-[40px]"
                        style={{background:incidentColor(inc.severity)}} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-sm">{inc.type}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{background:incidentColor(inc.severity)+'28',color:incidentColor(inc.severity)}}>
                            {inc.severity}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed">{inc.description}</p>
                        {inc.location?.address && (
                          <p className="text-gray-500 text-[11px] mt-1">📍 {inc.location.address}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MAP ── */}
      <div className="flex-grow h-full relative">

        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-[1100] w-9 h-9 bg-gray-900 border border-gray-600 rounded-xl flex items-center justify-center text-white hover:bg-gray-800 transition-all shadow-lg text-sm">
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {loadingRoute && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] bg-gray-900/90 border border-gray-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xl">
            <svg className="animate-spin w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Calculating route…
          </div>
        )}
        {route.length > 0 && !loadingRoute && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] bg-gray-900/90 border border-blue-700/50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-3 shadow-xl">
            <span className="text-blue-400">🗺️ Route active</span>
            <button onClick={() => setRoute([])} className="text-gray-400 hover:text-white transition-colors">✕</button>
          </div>
        )}
        {searchedCenter && !loadingPOI && (
          <div className="absolute top-4 right-4 z-[1100] flex flex-col gap-2 items-end">
            {places.length > 0 && (
              <div className="bg-gray-900/90 border border-gray-600 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg text-white">
                📍 {places.length} place{places.length!==1?'s':''}
              </div>
            )}
            {incidents.length > 0 && (
              <div className="bg-red-900/80 border border-red-700/50 text-red-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                ⚠️ {incidents.length} incident{incidents.length!==1?'s':''}
              </div>
            )}
            <button onClick={() => setShowRadius(!showRadius)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shadow-lg ${
                showRadius ? 'bg-yellow-900/60 border-yellow-700/50 text-yellow-300' : 'bg-gray-900/90 border-gray-600 text-gray-400'
              }`}>
              ⭕ Radius
            </button>
          </div>
        )}

        <MapContainer center={[20.5937, 78.9629]} zoom={5}
          style={{ height:'100%', width:'100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors" />

          <MapFlyTo target={flyTarget} />

          {userLocation && (
            <Marker position={userLocation} icon={makeUserIcon()}>
              <Tooltip direction="top" offset={[0,-9]}>Your Location</Tooltip>
            </Marker>
          )}

          {searchedCenter && (
            <>
              <Marker position={searchedCenter} icon={makeSearchCenterIcon()}>
                <Tooltip direction="top">Search centre</Tooltip>
              </Marker>
              {showRadius && (
                <Circle center={searchedCenter} radius={radius}
                  pathOptions={{ color:'#f59e0b', fillColor:'#f59e0b', fillOpacity:0.05, weight:1.5, dashArray:'6 4' }} />
              )}
            </>
          )}

          {places.map(place => {
            const ck  = catForResult(place);
            const sel = selectedPlace?.id === place.id;
            return (
              <Marker key={place.id} position={[place.lat, place.lon]}
                icon={makePlaceIcon(ck, sel)}
                zIndexOffset={sel ? 1000 : 0}
                eventHandlers={{ click: () => handleSelect(place) }}>
                <Popup maxWidth={220}>
                  <div className="text-gray-800 min-w-[170px]">
                    <p className="font-bold text-sm leading-tight mb-0.5">{place.name}</p>
                    <p className="text-xs text-gray-500 mb-1">{place.address}</p>
                    {place.distance!=null && <p className="text-xs text-gray-600 mb-1">📍 {fmtDist(place.distance)}</p>}
                    <button onClick={() => handleRoute(place)}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1.5 rounded text-xs mt-1 transition-all">
                      Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {incidents.map(inc => {
            if (!inc.location?.coordinates?.length) return null;
            const [lon, lat] = inc.location.coordinates;
            const clr = incidentColor(inc.severity);
            return (
              <CircleMarker key={inc._id} center={[lat,lon]} radius={10}
                pathOptions={{ color:clr, fillColor:clr, fillOpacity:0.5, weight:2 }}>
                <Popup maxWidth={200}>
                  <div className="text-gray-800">
                    <p className="font-bold text-xs uppercase mb-1" style={{color:clr}}>{inc.type} — {inc.severity}</p>
                    <p className="text-xs">{inc.description}</p>
                    {inc.location?.address && <p className="text-[11px] text-gray-500 mt-1">{inc.location.address}</p>}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {route.length > 1 && (
            <Polyline positions={route}
              pathOptions={{ color:'#3b82f6', weight:5, opacity:0.85 }} />
          )}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-5 right-5 bg-gray-900/90 border border-gray-700 rounded-2xl p-3 text-[11px] font-semibold z-[1000] space-y-1.5 shadow-2xl">
          {[
            { bg:'#22c55e', label:'You' },
            { bg:'#f59e0b', label:'Search centre' },
            { bg:'#f59e0b', label:'Attraction', emoji:'🎯' },
            { bg:'#ef4444', label:'Food & Drink', emoji:'🍽️' },
            { bg:'#3b82f6', label:'Museum', emoji:'🏛️' },
            { bg:'#22c55e', label:'Park', emoji:'🌳' },
          ].map(({bg, label, emoji}) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{background:bg}} />
              <span className="text-gray-300">{emoji ? `${emoji} ` : ''}{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="text-gray-300">Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 bg-blue-500 rounded shrink-0" />
            <span className="text-gray-300">Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;