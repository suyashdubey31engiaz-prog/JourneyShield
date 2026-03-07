import axios from 'axios';

// ─── Category map: friendly name → TomTom categorySet id ──────────────────────
const TOMTOM_CATEGORIES = {
  restaurants: '7315',
  hotels:      '7314',
  museums:     '9927',
  parks:       '9362',
  shopping:    '9361012',
  attractions: '9361',
  cafes:       '9361010',
  hospitals:   '7321',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));

// Normalise a TomTom result to our unified shape
const normaliseTomTom = (r) => ({
  id:           r.id || String(Math.random()),
  name:         r.poi?.name || r.address?.freeformAddress || 'Unknown',
  category:     r.poi?.categories?.[0] || 'Place',
  address:      r.address?.freeformAddress || '',
  city:         r.address?.municipality || '',
  distance:     r.dist ? Math.round(r.dist) : null,
  lat:          r.position?.lat,
  lon:          r.position?.lon,
  phone:        r.poi?.phone || null,
  website:      r.poi?.url  || null,
  openNow:      r.poi?.openingHours?.open24Hours
                  ? true
                  : r.poi?.openingHours?.timeRanges?.length > 0
                    ? null   // has hours but we don't parse them
                    : null,
});

// Normalise Nominatim to the same shape (fallback)
const normaliseNominatim = (r, centerLat, centerLon) => {
  const lat = parseFloat(r.lat);
  const lon = parseFloat(r.lon);
  // haversine distance in metres
  const R = 6371000;
  const dLat = (lat - centerLat) * Math.PI / 180;
  const dLon = (lon - centerLon) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2
    + Math.cos(centerLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon/2)**2;
  const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

  return {
    id:       String(r.place_id || Math.random()),
    name:     r.name || r.display_name?.split(',')[0] || 'Unknown',
    category: r.type || r.class || 'Place',
    address:  r.display_name || '',
    city:     r.address?.city || r.address?.town || r.address?.village || '',
    distance: dist,
    lat,
    lon,
    phone:    null,
    website:  null,
    openNow:  null,
  };
};


// ─── Controller 1: Geocode a place name ───────────────────────────────────────
// GET /api/search/geocode?q=Prayagraj
// Returns { lat, lon, displayName, boundingBox }
export const geocodeLocation = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Query parameter q is required.' });

  try {
    const url = `https://nominatim.openstreetmap.org/search`
      + `?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=1`;

    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'JourneyShield-App/1.0 (contact@journeyshield.app)' },
    });

    if (!data || data.length === 0) {
      return res.status(404).json({ message: `Could not geocode "${q}".` });
    }

    const top = data[0];
    return res.json({
      lat:         parseFloat(top.lat),
      lon:         parseFloat(top.lon),
      displayName: top.display_name,
      city:        top.address?.city || top.address?.town || top.address?.village || top.address?.county || q,
      boundingBox: top.boundingbox?.map(parseFloat) || null, // [minLat, maxLat, minLon, maxLon]
    });
  } catch (err) {
    console.error('[Geocode] Error:', err.message);
    return res.status(500).json({ message: 'Geocoding failed.' });
  }
};


// ─── Controller 2: Nearby POI search ─────────────────────────────────────────
// GET /api/search/places?lat=25.4&lon=81.8&radius=5000&query=museums&category=museums
// Uses TomTom; falls back to Nominatim/Overpass if TomTom has no key or returns 0 results
export const searchNearbyPlaces = async (req, res) => {
  const {
    lat,
    lon,
    radius   = '5000',
    query    = '',
    category = 'all',
  } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'lat and lon are required.' });
  }

  const centerLat = parseFloat(lat);
  const centerLon = parseFloat(lon);
  const radiusM   = Math.min(parseInt(radius), 50000); // cap at 50km

  const tomtomKey   = process.env.TOMTOM_API_KEY;
  const catId       = TOMTOM_CATEGORIES[category] || null;
  let   results     = [];

  // ── Attempt 1: TomTom ──────────────────────────────────────────────────────
  if (tomtomKey) {
    try {
      let tomtomUrl;

      if (query.trim()) {
        // fuzzySearch: keyword-aware, location-biased
        tomtomUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query.trim())}.json`
          + `?key=${tomtomKey}`
          + `&lat=${centerLat}&lon=${centerLon}`
          + `&radius=${radiusM}`
          + `&limit=20`
          + `&countrySet=IND`
          + (catId ? `&categorySet=${catId}` : '');
      } else {
        // nearbySearch: category-based, no keyword
        const catParam = catId || '9361,7315,7314,9927,9362,9361010'; // default popular cats
        tomtomUrl = `https://api.tomtom.com/search/2/nearbySearch/.json`
          + `?key=${tomtomKey}`
          + `&lat=${centerLat}&lon=${centerLon}`
          + `&radius=${radiusM}`
          + `&limit=20`
          + `&categorySet=${catParam}`;
      }

      const { data } = await axios.get(tomtomUrl);
      results = (data.results || [])
        .filter(r => r.poi?.name)   // only real POIs, not raw address results
        .map(normaliseTomTom);

      console.log(`[Search] TomTom returned ${results.length} results for "${query || category}" near (${centerLat},${centerLon})`);
    } catch (err) {
      console.error('[Search] TomTom error:', err.response?.data?.message || err.message);
      results = [];
    }
  }

  // ── Fallback: Nominatim ────────────────────────────────────────────────────
  // Triggers when: no TomTom key, TomTom errored, or returned 0 results
  if (results.length === 0) {
    try {
      // Build a search term: if user typed a query, use it; otherwise use a generic tourist POI term
      const nominatimQ = query.trim()
        ? query.trim()
        : (category !== 'all' ? category : 'tourist attraction');

      // Compute a small bounding box around center (±radius degrees approx)
      const deg = radiusM / 111320;
      const viewbox = [
        centerLon - deg, centerLat + deg,  // left, top
        centerLon + deg, centerLat - deg,  // right, bottom
      ].join(',');

      const url = `https://nominatim.openstreetmap.org/search`
        + `?q=${encodeURIComponent(nominatimQ)}`
        + `&format=json&addressdetails=1&limit=20`
        + `&bounded=1&viewbox=${viewbox}`;

      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'JourneyShield-App/1.0' },
      });

      await delay(200); // be polite to Nominatim

      results = (data || [])
        .filter(r => parseFloat(r.lat) !== 0)
        .map(r => normaliseNominatim(r, centerLat, centerLon));

      console.log(`[Search] Nominatim fallback returned ${results.length} results`);
    } catch (err) {
      console.error('[Search] Nominatim fallback error:', err.message);
    }
  }

  // Sort by distance
  results.sort((a, b) => (a.distance || 99999) - (b.distance || 99999));

  return res.json({ results, total: results.length });
};


// ─── Controller 3: Route calculation (TomTom) ────────────────────────────────
// GET /api/search/route?startLat=&startLon=&endLat=&endLon=
export const getRoute = async (req, res) => {
  const { startLat, startLon, endLat, endLon } = req.query;
  if (!startLat || !startLon || !endLat || !endLon) {
    return res.status(400).json({ message: 'Start and end coordinates are required.' });
  }

  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'TomTom API key not configured.' });

  const url = `https://api.tomtom.com/routing/1/calculateRoute/`
    + `${startLat},${startLon}:${endLat},${endLon}/json`
    + `?key=${apiKey}&travelMode=pedestrian`;

  try {
    const { data } = await axios.get(url);
    const points = data.routes[0].legs[0].points.map(p => [p.latitude, p.longitude]);
    return res.json(points);
  } catch (err) {
    console.error('[Route] TomTom error:', err.response?.data || err.message);
    // Fallback: straight line (at least something renders)
    return res.json([
      [parseFloat(startLat), parseFloat(startLon)],
      [parseFloat(endLat),   parseFloat(endLon)],
    ]);
  }
};