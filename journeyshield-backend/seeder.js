import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/userModel.js';
import Guide from './models/guideModel.js';
import Review from './models/reviewModel.js';
import Booking from './models/bookingModel.js'; // Import Booking model
import Incident from './models/incidentModel.js';

dotenv.config();

await connectDB();

const importData = async () => {
  try {
    // 1. Clear all previous data
    await Booking.deleteMany();
    await Review.deleteMany();
    await Guide.deleteMany();
    await User.deleteMany();
    // We optionally keep Incidents if you ran the other seeder, or clear them:
    // await Incident.deleteMany(); 

    console.log('Previous data cleared...');

    // 2. Create Password Hash
    const password = await bcrypt.hash('password123', 10);

    // 3. Create Users
    const users = await User.insertMany([
      { name: 'Rahul Traveler', username: 'rahul', email: 'rahul@example.com', password, role: 'Traveler' },
      { name: 'Amit Guide', username: 'amit', email: 'amit@example.com', password, role: 'Guide', verificationStatus: 'verified' },
      { name: 'Priya Guide', username: 'priya', email: 'priya@example.com', password, role: 'Guide', verificationStatus: 'verified' }
    ]);

    const traveler = users[0];
    const guideUser1 = users[1];
    const guideUser2 = users[2];

    // 4. Create Guide Profiles
    const guides = await Guide.insertMany([
      { 
        user: guideUser1._id, 
        location: 'Varanasi, India', 
        bio: 'Expert in spiritual tours and hidden ghats of Varanasi. 10 years experience.', 
        rating: 4.5, 
        reviews: 1 
      },
      { 
        user: guideUser2._id, 
        location: 'Jaipur, India', 
        bio: 'Historian and photographer specializing in Jaipur forts and palaces.', 
        rating: 0, 
        reviews: 0 
      },
    ]);

    // 5. Create a "Completed" Booking (So you can test rating immediately)
    // This booking allows 'Rahul' to rate 'Amit' immediately
    await Booking.create({
      traveler: traveler._id,
      guide: guides[0]._id,
      date: new Date('2023-12-01'), // Past date
      status: 'Completed',
      notes: 'Please show me the evening Aarti.',
      isReviewed: false // False means the "Rate Guide" button will be active!
    });

    // 6. Create a "Pending" Booking (To test Guide accepting/rejecting)
    await Booking.create({
      traveler: traveler._id,
      guide: guides[1]._id,
      date: new Date().setDate(new Date().getDate() + 5), // Future date
      status: 'Pending',
      notes: 'Looking for a half-day tour of Amber Fort.'
    });

    console.log('✅ Data Imported! You can log in as rahul@example.com / password123');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await Booking.deleteMany();
        await Review.deleteMany();
        await Guide.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}