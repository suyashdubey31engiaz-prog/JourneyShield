import React, { useState, useEffect } from 'react';
import safetyService from '../services/safetyReportService';

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
  const r   = 52;
  const circ = 2 * Math.PI * r;
  const fill = ((100 - score) / 100) * circ;

  const stroke =
    color === 'green'  ? '#22c55e' :
    color === 'teal'   ? '#14b8a6' :
    color === 'yellow' ? '#eab308' :
    color === 'orange' ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={stroke} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={fill}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="text-center z-10">
        <p className="text-4xl font-extrabold text-white leading-none">{score}</p>
        <p className="text-xs text-gray-400 mt-0.5">/ 100</p>
      </div>
    </div>
  );
};

// ─── Score Breakdown Bar ──────────────────────────────────────────────────────
const BreakdownBar = ({ label, deduction, max, color }) => {
  const abs  = Math.abs(deduction);
  const pct  = Math.min(100, (abs / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span className={abs > 0 ? 'text-red-400' : 'text-green-400'}>
          {abs > 0 ? `−${abs} pts` : 'No impact'}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Weather Card ─────────────────────────────────────────────────────────────
const WeatherGrid = ({ weather }) => {
  if (!weather) return (
    <div className="text-center py-6 text-gray-500 text-sm">Weather data unavailable</div>
  );
  const items = [
    { icon: '🌡️', label: 'Temperature',  value: `${weather.temp}°C` },
    { icon: '🤔', label: 'Feels Like',    value: `${weather.feelsLike}°C` },
    { icon: '💧', label: 'Humidity',      value: `${weather.humidity}%` },
    { icon: '💨', label: 'Wind Speed',    value: `${weather.windSpeed} km/h` },
    { icon: '👁️', label: 'Visibility',   value: `${weather.visibility} km` },
    { icon: '☁️', label: 'Cloud Cover',  value: `${weather.cloudCover}%` },
    { icon: '📊', label: 'Pressure',      value: `${weather.pressure} hPa` },
    { icon: '🌤️', label: 'Condition',    value: weather.description },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(({ icon, label, value }) => (
        <div key={label} className="bg-gray-900/60 border border-gray-700 rounded-xl p-3 text-center">
          <p className="text-lg mb-1">{icon}</p>
          <p className="text-gray-400 text-xs mb-0.5">{label}</p>
          <p className="text-white font-bold text-sm">{value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Incident Type Icon ───────────────────────────────────────────────────────
const incidentIcon = (type) => ({
  Theft:          '👜',
  Pickpocketing:  '🤏',
  Harassment:     '😠',
  Assault:        '⚠️',
  Scam:           '🎭',
  'Unsafe Area':  '🚧',
  Other:          '📍',
}[type] || '📍');

const severityColor = (sev) => ({
  Critical: 'bg-red-900/40 text-red-400 border-red-800/60',
  High:     'bg-orange-900/40 text-orange-400 border-orange-800/60',
  Medium:   'bg-yellow-900/40 text-yellow-400 border-yellow-800/60',
  Low:      'bg-blue-900/40 text-blue-400 border-blue-800/60',
}[sev] || 'bg-gray-800 text-gray-400 border-gray-700');

// ─── Full Report Card ─────────────────────────────────────────────────────────
const ReportCard = ({ report, label }) => {
  const [tab, setTab] = useState('overview');

  const ringColor = report.safetyColor;
  const borderColor =
    ringColor === 'green'  ? 'border-green-500/30'  :
    ringColor === 'teal'   ? 'border-teal-500/30'   :
    ringColor === 'yellow' ? 'border-yellow-500/30' :
    ringColor === 'orange' ? 'border-orange-500/30' : 'border-red-500/30';
  const bgGlow =
    ringColor === 'green'  ? 'bg-green-900/5'   :
    ringColor === 'teal'   ? 'bg-teal-900/5'    :
    ringColor === 'yellow' ? 'bg-yellow-900/5'  :
    ringColor === 'orange' ? 'bg-orange-900/5'  : 'bg-red-900/5';
  const levelColor =
    ringColor === 'green'  ? 'text-green-400'   :
    ringColor === 'teal'   ? 'text-teal-400'    :
    ringColor === 'yellow' ? 'text-yellow-400'  :
    ringColor === 'orange' ? 'text-orange-400'  : 'text-red-400';

  const tabs = ['overview', 'weather', 'incidents', 'tips'];

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgGlow} overflow-hidden shadow-xl animate-fadeIn`}>

      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-gray-700/50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <span>🛡️</span>
          <span className="uppercase tracking-widest font-bold">{label}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow">
            <h3 className="text-2xl font-extrabold text-white">{report.location}</h3>
            <p className={`text-sm font-bold mt-1 ${levelColor}`}>
              {report.safetyEmoji} {report.safetyLevel}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Updated {new Date(report.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <ScoreRing score={report.safetyScore} color={ringColor} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-700/50">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t
                ? `${levelColor} border-b-2 ${borderColor.replace('border-', 'border-b-')}`
                : 'text-gray-500 hover:text-gray-300'
            }`}>
            {t === 'overview' ? '📊 Overview' :
             t === 'weather'  ? `${report.weather?.icon || '🌤️'} Weather` :
             t === 'incidents'? '🚨 Incidents' : '💡 Tips'}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="p-6">

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Score breakdown */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Score Breakdown</p>
              <div className="space-y-3">
                <BreakdownBar label="🚨 Incident Reports"   deduction={report.scoreBreakdown.incidents} max={40} color="bg-red-500" />
                <BreakdownBar label="🌦️ Weather Conditions" deduction={report.scoreBreakdown.weather}   max={35} color="bg-blue-500" />
                <BreakdownBar label="🚗 Traffic Conditions" deduction={report.scoreBreakdown.traffic}   max={15} color="bg-orange-500" />
              </div>
            </div>

            {/* Quick stat pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs mb-0.5">Incidents Nearby</p>
                <p className="font-bold text-white text-lg">{report.incidentCount}</p>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs mb-0.5">Temperature</p>
                <p className="font-bold text-white text-lg">{report.weather ? `${report.weather.temp}°C` : '—'}</p>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs mb-0.5">Traffic</p>
                <p className="font-bold text-white text-sm">{report.traffic?.label || '—'}</p>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs mb-0.5">Wind Speed</p>
                <p className="font-bold text-white text-lg">{report.weather ? `${report.weather.windSpeed} km/h` : '—'}</p>
              </div>
            </div>

            {/* Active warnings */}
            {report.weatherWarnings?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">⚠️ Active Advisories</p>
                {report.weatherWarnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 bg-yellow-900/20 border border-yellow-800/40 rounded-xl px-4 py-3">
                    <span className="text-yellow-400 text-sm shrink-0 mt-0.5">⚠️</span>
                    <p className="text-yellow-200 text-sm">{w}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WEATHER TAB */}
        {tab === 'weather' && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              {report.weather?.icon} Detailed Weather Conditions
            </p>
            <WeatherGrid weather={report.weather} />
            {report.weather && report.traffic && (
              <div className="mt-4 bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">🚗 Traffic Snapshot</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-gray-400 text-xs">Current Speed</p>
                    <p className="text-white font-bold">{report.traffic.currentSpeed} km/h</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Free Flow</p>
                    <p className="text-white font-bold">{report.traffic.freeFlow} km/h</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Flow Status</p>
                    <p className={`font-bold text-sm ${
                      report.traffic.label === 'Free flow' ? 'text-green-400' :
                      report.traffic.label === 'Moderate traffic' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{report.traffic.label}</p>
                  </div>
                </div>
                {report.traffic.ratio != null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Traffic efficiency</span>
                      <span>{report.traffic.ratio}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        report.traffic.ratio > 70 ? 'bg-green-500' :
                        report.traffic.ratio > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} style={{ width: `${report.traffic.ratio}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {(!report.weather && !report.traffic) && (
              <p className="text-gray-500 text-sm text-center py-6">Weather & traffic data unavailable for this location.</p>
            )}
          </div>
        )}

        {/* INCIDENTS TAB */}
        {tab === 'incidents' && (
          <div className="space-y-4">
            {report.incidentCount === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-3">✅</p>
                <p className="text-green-400 font-bold">No incidents reported nearby</p>
                <p className="text-gray-500 text-sm mt-1">Within 10 km radius</p>
              </div>
            ) : (
              <>
                {/* Type breakdown */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Incident Types (10km radius)</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(report.incidentBreakdown).map(([type, count]) => (
                    <span key={type}
                      className="inline-flex items-center gap-1.5 bg-gray-900/60 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {incidentIcon(type)} {type}
                      <span className="bg-red-600/60 text-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
                    </span>
                  ))}
                </div>

                {/* Recent list */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Most Recent Reports</p>
                <div className="space-y-2">
                  {report.recentIncidents.map((inc, i) => (
                    <div key={i}
                      className="flex items-center gap-3 bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3">
                      <span className="text-xl shrink-0">{incidentIcon(inc.type)}</span>
                      <div className="flex-grow min-w-0">
                        <p className="text-white font-semibold text-sm">{inc.type}</p>
                        <p className="text-gray-500 text-xs truncate">{inc.address}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg border ${severityColor(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </div>
                  ))}
                  {report.incidentCount > 5 && (
                    <p className="text-center text-gray-500 text-xs pt-1">
                      + {report.incidentCount - 5} more incidents in this area
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TIPS TAB */}
        {tab === 'tips' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">💡 Safety Recommendations</p>
            {report.safetyTips.map((tip, i) => (
              <div key={i}
                className="flex items-start gap-3 bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3.5">
                <span className="text-yellow-400 font-bold text-sm shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-gray-200 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const ReportSkeleton = () => (
  <div className="rounded-2xl border border-gray-700 overflow-hidden animate-pulse">
    <div className="px-6 py-5 border-b border-gray-700">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-grow">
          <div className="h-3 bg-gray-700 rounded w-24" />
          <div className="h-6 bg-gray-700 rounded w-48" />
          <div className="h-4 bg-gray-700 rounded w-20" />
        </div>
        <div className="w-36 h-36 rounded-full bg-gray-700" />
      </div>
    </div>
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-800 rounded-xl" />)}
      </div>
      <div className="h-24 bg-gray-800 rounded-xl" />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Alerts = () => {
  const [city, setCity]                   = useState('');
  const [searchedReport, setSearchedReport] = useState(null);
  const [currentReport, setCurrentReport]   = useState(null);
  const [loadingSearch, setLoadingSearch]   = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [searchError, setSearchError]       = useState('');
  const [currentError, setCurrentError]     = useState('');

  // Auto-load current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentError('Geolocation not supported by your browser.');
      setLoadingCurrent(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        safetyService.getSafetyReport(null, coords.latitude, coords.longitude)
          .then((res) => setCurrentReport(res.data))
          .catch(() => setCurrentError('Could not analyze current location.'))
          .finally(() => setLoadingCurrent(false));
      },
      () => {
        setCurrentError('Enable location permissions to see your local safety score.');
        setLoadingCurrent(false);
      }
    );
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoadingSearch(true);
    setSearchError('');
    setSearchedReport(null);

    safetyService.getSafetyReport(city.trim())
      .then((res) => setSearchedReport(res.data))
      .catch(() => setSearchError(`Could not generate report for "${city}". Check the city name and try again.`))
      .finally(() => setLoadingSearch(false));
  };

  return (
    <div className="container mx-auto px-6 py-10 text-white max-w-4xl animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          🛡️ Safety Analytics
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Real-time safety scores powered by incident reports, live weather conditions, and traffic data.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="mb-10">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-grow">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search any city — e.g. Mumbai, Jaipur, Delhi..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all text-sm"
            />
          </div>
          <button type="submit" disabled={loadingSearch || !city.trim()}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-yellow-500/20 flex items-center gap-2 shrink-0">
            {loadingSearch ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analyzing…
              </>
            ) : '⚡ Analyze'}
          </button>
        </form>
      </div>

      <div className="space-y-8">

        {/* ── Searched City Report ── */}
        {(loadingSearch || searchedReport || searchError) && (
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-l-4 border-yellow-500 pl-3">
              Search Result
            </h2>
            {loadingSearch  && <ReportSkeleton />}
            {searchError    && (
              <div className="bg-red-900/20 border border-red-800/40 text-red-400 p-5 rounded-2xl text-sm flex items-start gap-3">
                <span className="text-xl shrink-0">❌</span>
                <p>{searchError}</p>
              </div>
            )}
            {searchedReport && <ReportCard report={searchedReport} label="Searched City" />}
          </div>
        )}

        {/* ── Current Location Report ── */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-l-4 border-cyan-500 pl-3">
            Your Current Location
          </h2>
          {loadingCurrent && <ReportSkeleton />}
          {currentError   && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">📍</p>
              <p className="text-gray-300 font-semibold mb-1">Location Access Needed</p>
              <p className="text-gray-500 text-sm">{currentError}</p>
            </div>
          )}
          {!loadingCurrent && !currentError && currentReport && (
            <ReportCard report={currentReport} label="Current Location" />
          )}
        </div>

        {/* ── Score Legend ── */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">📊 Score Guide</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { range: '80–100', label: 'Safe',          color: 'text-green-400',  bg: 'bg-green-900/20 border-green-800/40' },
              { range: '65–79',  label: 'Low Risk',       color: 'text-teal-400',   bg: 'bg-teal-900/20 border-teal-800/40' },
              { range: '50–64',  label: 'Moderate Risk',  color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40' },
              { range: '35–49',  label: 'High Risk',      color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800/40' },
              { range: '0–34',   label: 'Danger',         color: 'text-red-400',    bg: 'bg-red-900/20 border-red-800/40' },
            ].map(({ range, label, color, bg }) => (
              <div key={range} className={`text-center p-3 rounded-xl border ${bg}`}>
                <p className={`font-extrabold text-sm ${color}`}>{range}</p>
                <p className="text-gray-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center">
            Score = 100 − incident deductions − weather risk − traffic congestion
          </p>
        </div>
      </div>
    </div>
  );
};

export default Alerts;