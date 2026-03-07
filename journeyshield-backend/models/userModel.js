import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // ── Auth ──────────────────────────────────────────────────────────────────
  name:     { type: String, required: [true, 'Full name is required'] },
  username: { type: String, required: [true, 'Username is required'], unique: true },
  email:    { type: String, required: [true, 'Email is required'], unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  role:     { type: String, enum: ['Traveler', 'Guide', 'Both', 'Admin'], default: 'Traveler' },

  // ── Traveler Profile Fields ───────────────────────────────────────────────
  bio:          { type: String, default: '' },
  homeCity:     { type: String, default: '' },
  phone:        { type: String, default: '' },
  travelStyle:  {
    type: String,
    enum: ['Adventure', 'Leisure', 'Cultural', 'Budget', 'Luxury', 'Solo', 'Family', 'Backpacking', ''],
    default: '',
  },
  interests:  { type: [String], default: [] },
  languages:  { type: [String], default: [] },
  medicalNotes: { type: String, default: '' },
  emergencyContact: {
    name:     { type: String, default: '' },
    phone:    { type: String, default: '' },
    relation: { type: String, default: '' },
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    website:   { type: String, default: '' },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;