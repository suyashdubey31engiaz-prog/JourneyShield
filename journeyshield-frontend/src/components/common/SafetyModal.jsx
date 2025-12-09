import React from 'react';

const SafetyModal = ({ place, onClose }) => {
  if (!place) return null;

  // Placeholder safety data
  const safetyData = {
    weather: 'Clear, 28°C',
    crowd: 'Moderate',
    traffic: 'Light',
    recommendation: 'Good to visit now',
  };

  return (
    // This creates the overlay and the modal itself
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg border border-yellow-400/20 w-full max-w-md">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">{place.name}</h2>
        <p className="text-sm text-gray-400 mb-4">{place.location.address}</p>
        
        <div className="space-y-3 text-gray-200">
          <p><strong>Weather:</strong> {safetyData.weather}</p>
          <p><strong>Crowd Level:</strong> {safetyData.crowd}</p>
          <p><strong>Traffic:</strong> {safetyData.traffic}</p>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-lg"><strong>Recommendation:</strong> <span className="text-green-400 font-semibold">{safetyData.recommendation}</span></p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-700 text-white font-semibold py-2 rounded-md hover:bg-yellow-500 hover:text-black transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SafetyModal;