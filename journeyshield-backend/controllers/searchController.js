import axios from 'axios';

const searchPlaces = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'A search query is required.' });
  }

  const apiKey = process.env.TOMTOM_API_KEY;

  try {
    // STEP 1: Geocode the search query to get its coordinates.
    const geocodeUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(query)}.json?key=${apiKey}&countrySet=IND&limit=1`;
    const geocodeResponse = await axios.get(geocodeUrl);

    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      return res.status(404).json({ message: 'Location not found.' });
    }

    const { lat, lon } = geocodeResponse.data.results[0].position;

    // STEP 2: Use the coordinates to find nearby places within a 30km radius.
    // We search for popular categories like tourist attractions, restaurants, and cafes.
    const searchUrl = `https://api.tomtom.com/search/2/nearbySearch/.json?key=${apiKey}&lat=${lat}&lon=${lon}&radius=30000&limit=20&categorySet=9361,7315,9376`;
    
    const searchResponse = await axios.get(searchUrl);
    const results = searchResponse.data.results;

    // Format the results into the structure our frontend expects.
    const formattedPlaces = results.map(place => ({
      id: place.id,
      name: place.poi.name,
      geocodes: {
        main: {
          latitude: place.position.lat,
          longitude: place.position.lon,
        }
      },
      location: {
        formatted_address: place.address.freeformAddress,
      }
    }));

    res.json(formattedPlaces);
  } catch (error) {
    console.error("TomTom Search API Error:", error.response?.data?.details || error.message);
    res.status(500).json({ message: 'Error fetching search results from TomTom.' });
  }
};

export { searchPlaces };