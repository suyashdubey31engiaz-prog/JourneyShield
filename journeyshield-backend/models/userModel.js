import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Full name is required'] },
  username: { type: String, required: [true, 'Username is required'], unique: true },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  // FIX: Added 'Both' to the allowed roles
  role: { type: String, enum: ['Traveler', 'Guide', 'Both', 'Admin'], default: 'Traveler' },
  location: { type: String },
  bio: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;