import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testFoursquareApi = async () => {
  const lat = '25.4358';
  const lon = '81.8463';
  const apiKey = process.env.FOURSQUARE_API_KEY;

  if (!apiKey) {
    console.error('ERROR: Foursquare API key not found in .env file.');
    return;
  }

  console.log('Testing Foursquare API with key:', apiKey.slice(0, 4) + '...');

  const url = `https://api.foursquare.com/v3/places/search?ll=${lat}%2C${lon}&radius=5000&limit=5`;

  const options = {
    method: 'GET',
    url: url,
    headers: {
      accept: 'application/json',
      Authorization: apiKey,
    },
  };

  try {
    const response = await axios.request(options);
    console.log('SUCCESS! Received data from Foursquare:');
    console.log(response.data);
  } catch (error) {
    console.error('ERROR during API call:');
    // Log the most important parts of the error
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

testFoursquareApi();