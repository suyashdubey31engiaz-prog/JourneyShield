import axios    from 'axios';
import Incident from '../models/incidentModel.js';

// ─────────────────────────────────────────────────────────────────────────────
// SCORE ENGINE
// Formula: 100 − incidentDeductions − weatherDeductions − trafficDeductions
// Each category is capped so one bad factor can't zero out everything alone.
// ─────────────────────────────────────────────────────────────────────────────

const calcIncidentScore = (incidents) => {
  const WEIGHTS = { Critical: 20, High: 12, Medium: 6, Low: 3 };
  const deduction = incidents.reduce((sum, i) => sum + (WEIGHTS[i.severity] || 3), 0);
  return Math.min(40, deduction); // cap at -40
};

const calcWeatherScore = (w) => {
  if (!w) return { deduction: 0, warnings: [], icon: '🌤️' };

  const warnings = [];
  let deduction  = 0;
  const code     = w.weather?.[0]?.id || 800;
  const temp     = w.main?.temp       || 25;
  const wind     = w.wind?.speed      || 0;   // m/s
  const vis      = w.visibility       || 10000; // metres
  const humidity = w.main?.humidity   || 50;

  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) { deduction += 15; warnings.push('⚡ Thunderstorm — avoid open areas'); }
  else if (code >= 300 && code < 400) { deduction += 6; warnings.push('🌦️ Drizzle — roads may be slippery'); }
  else if (code >= 500 && code < 600) {
    if (code >= 502) { deduction += 14; warnings.push('🌧️ Heavy rain — flooding risk'); }
    else             { deduction += 8;  warnings.push('🌧️ Rain — reduced visibility'); }
  }
  else if (code >= 600 && code < 700) { deduction += 12; warnings.push('❄️ Snowfall — hazardous roads'); }
  else if (code >= 700 && code < 800) { deduction += 7;  warnings.push('🌫️ Low visibility — drive carefully'); }

  // Temperature extremes
  if      (temp > 42) { deduction += 10; warnings.push(`🔥 Extreme heat ${Math.round(temp)}°C — risk of heatstroke`); }
  else if (temp > 38) { deduction += 6;  warnings.push(`☀️ Very hot ${Math.round(temp)}°C — stay hydrated`); }
  else if (temp < 2)  { deduction += 8;  warnings.push(`🥶 Near-freezing ${Math.round(temp)}°C — ice possible`); }

  // Wind
  const windKmh = wind * 3.6;
  if      (windKmh > 60) { deduction += 10; warnings.push(`💨 Strong gale ${Math.round(windKmh)} km/h — avoid heights`); }
  else if (windKmh > 35) { deduction += 5;  warnings.push(`💨 Strong wind ${Math.round(windKmh)} km/h`); }

  // Visibility
  if      (vis < 500)  { deduction += 8; warnings.push('🌁 Very low visibility — extreme caution'); }
  else if (vis < 2000) { deduction += 4; warnings.push('🌁 Reduced visibility'); }

  // Humidity comfort
  if (humidity > 85 && temp > 30) { deduction += 3; warnings.push('💧 High heat-humidity — risk of exhaustion'); }

  const icon =
    code >= 200 && code < 300 ? '⛈️' :
    code >= 300 && code < 400 ? '🌦️' :
    code >= 500 && code < 600 ? '🌧️' :
    code >= 600 && code < 700 ? '❄️' :
    code >= 700 && code < 800 ? '🌫️' :
    code === 800               ? '☀️' :
    code <= 802                ? '🌤️' : '☁️';

  return { deduction: Math.min(35, deduction), warnings, icon };
};

const calcTrafficScore = (trafficData) => {
  if (!trafficData?.flowSegmentData) return { deduction: 0, label: 'Unavailable', ratio: null };
  const { currentSpeed, freeFlowSpeed } = trafficData.flowSegmentData;
  if (!freeFlowSpeed || freeFlowSpeed === 0) return { deduction: 0, label: 'Unknown', ratio: null };
  const ratio = currentSpeed / freeFlowSpeed;
  if      (ratio < 0.3) return { deduction: 10, label: 'Severe congestion',  ratio };
  else if (ratio < 0.6) return { deduction: 6,  label: 'Heavy traffic',      ratio };
  else if (ratio < 0.8) return { deduction: 3,  label: 'Moderate traffic',   ratio };
  else                  return { deduction: 0,  label: 'Free flow',           ratio };
};

const getSafetyLevel = (score) => {
  if (score >= 80) return { level: 'Safe',          color: 'green',  emoji: '✅' };
  if (score >= 65) return { level: 'Low Risk',       color: 'teal',   emoji: '🟢' };
  if (score >= 50) return { level: 'Moderate Risk',  color: 'yellow', emoji: '⚠️' };
  if (score >= 35) return { level: 'High Risk',      color: 'orange', emoji: '🔶' };
  return               { level: 'Danger',           color: 'red',    emoji: '🚨' };
};

// Returns contextual safety tips based on current conditions
const getSafetyTips = (score, weatherWarnings, incidentTypes, trafficLabel) => {
  const tips = [];
  if (incidentTypes.includes('Theft') || incidentTypes.includes('Pickpocketing'))
    tips.push('Keep valuables hidden and use inside pockets in crowded areas');
  if (incidentTypes.includes('Assault') || incidentTypes.includes('Harassment'))
    tips.push('Avoid isolated areas, especially after dark');
  if (incidentTypes.includes('Scam'))
    tips.push('Use only official taxis and pre-agreed prices');
  if (trafficLabel === 'Severe congestion' || trafficLabel === 'Heavy traffic')
    tips.push('Expect delays — budget extra travel time or use metro/bus');
  if (weatherWarnings.length > 0)
    tips.push('Monitor the weather and have an indoor backup plan');
  if (score < 50)
    tips.push('Consider hiring a local guide who knows safe routes in this area');
  if (tips.length === 0)
    tips.push('Conditions look good — enjoy your trip responsibly!');
  return tips;
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE REPORT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
const buildReport = async (lat, lon, locationName) => {
  const owKey  = process.env.OPENWEATHER_API_KEY;
  const ttKey  = process.env.TOMTOM_API_KEY;

  const [weatherRes, trafficRes] = await Promise.allSettled([
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${owKey}&units=metric`),
    axios.get(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${ttKey}`)
  ]);

  const incidents = await Incident.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lon, lat] },
        $maxDistance: 10000
      }
    }
  }).limit(30);

  // ── Score calculation ──
  const incidentDeduction = calcIncidentScore(incidents);
  const weatherRaw        = weatherRes.status === 'fulfilled' ? weatherRes.value.data : null;
  const trafficRaw        = trafficRes.status === 'fulfilled' ? trafficRes.value.data : null;
  const weatherAnalysis   = calcWeatherScore(weatherRaw);
  const trafficAnalysis   = calcTrafficScore(trafficRaw);

  const rawScore    = 100 - incidentDeduction - weatherAnalysis.deduction - trafficAnalysis.deduction;
  const safetyScore = Math.max(0, Math.round(rawScore));
  const status      = getSafetyLevel(safetyScore);

  // ── Rich weather object ──
  const weather = weatherRaw ? {
    temp:        Math.round(weatherRaw.main.temp),
    feelsLike:   Math.round(weatherRaw.main.feels_like),
    humidity:    weatherRaw.main.humidity,
    description: weatherRaw.weather[0].description
                   .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    icon:        weatherAnalysis.icon,
    windSpeed:   weatherRaw.wind?.speed != null ? Math.round(weatherRaw.wind.speed * 3.6) : 0, // km/h
    visibility:  Math.round((weatherRaw.visibility || 10000) / 1000 * 10) / 10, // km
    pressure:    weatherRaw.main.pressure,
    cloudCover:  weatherRaw.clouds?.all || 0,
  } : null;

  // ── Traffic object ──
  const traffic = trafficRaw?.flowSegmentData ? {
    currentSpeed: Math.round(trafficRaw.flowSegmentData.currentSpeed),
    freeFlow:     Math.round(trafficRaw.flowSegmentData.freeFlowSpeed),
    label:        trafficAnalysis.label,
    ratio:        trafficAnalysis.ratio ? Math.round(trafficAnalysis.ratio * 100) : null,
  } : null;

  // ── Incident breakdown ──
  const incidentBreakdown = {};
  incidents.forEach(i => {
    incidentBreakdown[i.type] = (incidentBreakdown[i.type] || 0) + 1;
  });

  const incidentTypes = incidents.map(i => i.type);
  const tips = getSafetyTips(safetyScore, weatherAnalysis.warnings, incidentTypes, trafficAnalysis.label);

  return {
    location:      locationName,
    coordinates:   { lat, lon },
    safetyScore,
    safetyLevel:   status.level,
    safetyColor:   status.color,
    safetyEmoji:   status.emoji,

    // Score breakdown — shows WHY the score is what it is
    scoreBreakdown: {
      base:     100,
      incidents: -incidentDeduction,
      weather:  -weatherAnalysis.deduction,
      traffic:  -trafficAnalysis.deduction,
    },

    // Detailed data
    weather,
    traffic,
    incidentCount:     incidents.length,
    incidentBreakdown,
    recentIncidents:   incidents.slice(0, 5).map(i => ({
      type:     i.type,
      severity: i.severity,
      address:  i.location?.address || 'Nearby',
    })),

    // Advisories and tips
    weatherWarnings: weatherAnalysis.warnings,
    safetyTips:      tips,

    generatedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

export const getSafetyReportByCity = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ message: 'City parameter is required' });

  try {
    const geo = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'JourneyShield-App/1.0' } }
    );
    if (!geo.data.length) return res.status(404).json({ message: `City "${city}" not found.` });

    const lat  = parseFloat(geo.data[0].lat);
    const lon  = parseFloat(geo.data[0].lon);
    const name = geo.data[0].display_name?.split(',')[0] || city;

    res.json(await buildReport(lat, lon, name));
  } catch (err) {
    console.error('Safety Report City Error:', err.message);
    res.status(500).json({ message: 'Failed to generate safety report.' });
  }
};

export const getSafetyReportByCoords = async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ message: 'Lat/Lon required' });

  let locationName = 'Current Location';
  try {
    const rev = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'JourneyShield-App/1.0' } }
    );
    if (rev.data?.address) {
      const a = rev.data.address;
      locationName = a.city || a.town || a.state_district || a.county || a.state || 'Current Location';
    }
  } catch (e) { /* reverse geocode failure is non-fatal */ }

  try {
    res.json(await buildReport(parseFloat(lat), parseFloat(lon), locationName));
  } catch (err) {
    console.error('Safety Report Coords Error:', err.message);
    res.status(500).json({ message: 'Failed to generate safety report.' });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({});
    res.status(200).json(incidents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch incidents' });
  }
};