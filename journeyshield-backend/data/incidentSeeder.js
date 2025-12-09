import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Incident from '../models/incidentModel.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

// Helper to generate random coordinates within a radius (in km)
// This ensures the crimes appear "around" a city, not just at one single dot.
const generateRandomPoint = (center, radius) => {
  const y0 = center.latitude;
  const x0 = center.longitude;
  const rd = radius * 1000 / 111300; // Convert km to degrees approximation

  const u = Math.random();
  const v = Math.random();
  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  return {
    latitude: y + y0,
    longitude: x + x0
  };
};

const seedIncidents = async () => {
  try {
    // 1. CLEAR OLD DATA (Optional: Comment this out if you want to keep adding more)
    await Incident.deleteMany(); 
    console.log('Old incidents removed...');

    // 2. DEFINE HOTSPOTS (Add more cities here if you want)
    const cities = [
      { name: 'Prayagraj', latitude: 25.4358, longitude: 81.8463 },
      { name: 'Varanasi', latitude: 25.3176, longitude: 82.9739 },
      { name: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
      { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
      { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946 }
    ];

    const types = ['Theft', 'Harassment', 'Scam', 'Unsafe Area', 'Assault', 'Pickpocketing'];
    const severities = ['Low', 'Medium', 'High'];
    const incidents = [];

    // 3. GENERATE LOOPS
    // This creates 50 random incidents around EACH city defined above.
    cities.forEach(city => {
      console.log(`Generating data for ${city.name}...`);
      for (let i = 0; i < 50; i++) {
        const point = generateRandomPoint(city, 5); // 5km radius spread
        const type = types[Math.floor(Math.random() * types.length)];
        
        incidents.push({
          type: type,
          description: `Reported ${type} incident near ${city.name}. Exercise caution.`,
          location: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude], // GeoJSON order: [Lon, Lat]
            address: `Near ${city.name} center`
          },
          severity: severities[Math.floor(Math.random() * severities.length)],
          verified: true,
          // Randomize date within last 30 days
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
        });
      }
    });

    // 4. INSERT INTO DB
    await Incident.insertMany(incidents);
    console.log(`✅ Successfully seeded ${incidents.length} dummy incidents!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedIncidents();