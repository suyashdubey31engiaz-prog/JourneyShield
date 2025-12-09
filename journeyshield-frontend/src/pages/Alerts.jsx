import React, { useState, useEffect } from 'react';
import alertService from '../services/safetyReportService'; // NOTE: Using safetyReportService, not alertService

const SafetyScoreCard = ({ report }) => {
    if (!report) return null;

    // Dynamic color classes based on safety level
    const colorClass = 
        report.safetyColor === 'green' ? 'text-green-400 border-green-500/30 bg-green-900/10' :
        report.safetyColor === 'red' ? 'text-red-400 border-red-500/30 bg-red-900/10' :
        'text-yellow-400 border-yellow-500/30 bg-yellow-900/10';

    return (
        <div className={`mt-6 p-6 rounded-xl border ${colorClass} shadow-lg transition-all`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{report.location}</h3>
                    <p className="text-gray-400 text-sm">Real-time Safety Analysis</p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-bold">{report.safetyScore}</div>
                    <div className="text-sm font-medium uppercase tracking-wide opacity-80">Safety Score</div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Safety Level</p>
                    <p className={`font-bold text-lg ${report.safetyColor === 'red' ? 'text-red-400' : report.safetyColor === 'green' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {report.safetyLevel}
                    </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Active Incidents</p>
                    <p className="font-bold text-lg text-white">{report.incidentCount}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Weather</p>
                    <p className="font-bold text-lg text-white truncate">{report.weather.split(',')[0]}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Traffic Flow</p>
                    <p className="font-bold text-lg text-white truncate">{report.traffic.replace('Flow: ', '')}</p>
                </div>
            </div>

            {report.incidentCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-2">Recent Reports nearby:</p>
                    <div className="flex flex-wrap gap-2">
                        {report.recentIncidents.map((type, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-600">
                                {type}
                            </span>
                        ))}
                        {report.incidentCount > 3 && <span className="text-xs text-gray-500 self-center">...and more</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

const Alerts = () => {
    const [city, setCity] = useState('');
    const [searchedReport, setSearchedReport] = useState(null);
    const [currentReport, setCurrentReport] = useState(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingCurrent, setLoadingCurrent] = useState(true);
    const [searchError, setSearchError] = useState('');
    const [currentError, setCurrentError] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    alertService.getSafetyReport(null, latitude, longitude) // Modified service call
                        .then(res => setCurrentReport(res.data))
                        .catch(() => setCurrentError('Could not analyze current location.'))
                        .finally(() => setLoadingCurrent(false));
                },
                () => {
                    setCurrentError('Enable location to see local safety score.');
                    setLoadingCurrent(false);
                }
            );
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!city) return;
        setLoadingSearch(true);
        setSearchError('');
        setSearchedReport(null);

        alertService.getSafetyReport(city)
            .then(res => setSearchedReport(res.data))
            .catch(() => setSearchError(`Could not analyze safety for "${city}".`))
            .finally(() => setLoadingSearch(false));
    };

    return (
        <div className="container mx-auto p-6 text-white max-w-4xl min-h-screen">
            <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">Safety Analytics</h1>
            
            {/* Current Location Section */}
            <div className="mb-10">
                <h2 className="text-xl text-gray-400 mb-4 border-l-4 border-yellow-500 pl-3">Your Current Location</h2>
                {loadingCurrent && <div className="animate-pulse h-40 bg-gray-800 rounded-xl"></div>}
                {currentError && <p className="text-red-400 bg-red-900/20 p-4 rounded-lg">{currentError}</p>}
                {!loadingCurrent && !currentError && <SafetyScoreCard report={currentReport} />}
            </div>

            {/* Search Section */}
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                <h2 className="text-xl text-gray-400 mb-4 border-l-4 border-blue-500 pl-3">Check Another City</h2>
                <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
                    <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city name (e.g. Mumbai)" 
                        className="flex-grow bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white" 
                    />
                    <button type="submit" disabled={loadingSearch} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 min-w-[100px]">
                        {loadingSearch ? '...' : 'Analyze'}
                    </button>
                </form>

                {searchError && <p className="text-red-400 text-center">{searchError}</p>}
                {searchedReport && <SafetyScoreCard report={searchedReport} />}
            </div>
        </div>
    );
};

export default Alerts;