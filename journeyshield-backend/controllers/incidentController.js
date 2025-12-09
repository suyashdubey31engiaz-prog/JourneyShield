import Incident from '../models/incidentModel.js';

// @desc    Report a new safety incident
// @route   POST /api/incidents
// @access  Public (or Protected)
const reportIncident = async (req, res) => {
  const { type, description, latitude, longitude, severity, address } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Location coordinates are required' });
  }

  try {
    const incident = await Incident.create({
      type,
      description,
      severity,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)], // GeoJSON expects [lon, lat]
        address
      },
      reportedBy: req.user ? req.user._id : null
    });

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get incidents near a specific location
// @route   GET /api/incidents
// @access  Public
const getNearbyIncidents = async (req, res) => {
  const { lat, lon, radius } = req.query;

  // Default search: Prayagraj coordinates if none provided
  const centerLat = lat ? parseFloat(lat) : 25.4358;
  const centerLon = lon ? parseFloat(lon) : 81.8463;
  const distanceInMeters = radius ? parseInt(radius) * 1000 : 5000; // Default 5km

  try {
    const incidents = await Incident.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [centerLon, centerLat]
          },
          $maxDistance: distanceInMeters
        }
      }
    });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export { reportIncident, getNearbyIncidents };