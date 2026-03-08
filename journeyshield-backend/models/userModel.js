import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'Full name is required'] },
  username: { type: String, required: [true, 'Username is required'], unique: true },
  email:    { type: String, required: [true, 'Email is required'],    unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  role:     { type: String, enum: ['Traveler', 'Guide', 'Both', 'Admin'], default: 'Traveler' },

  // ── Profile picture (Cloudinary URL — keeps MongoDB lean) ─────────────────
  avatar: { type: String, default: '' },

  // ── Basic info ─────────────────────────────────────────────────────────────
  bio:         { type: String,  default: '' },
  homeCity:    { type: String,  default: '' },
  phone:       { type: String,  default: '' },   // kept private from guides until chat approved
  travelStyle: {
    type: String,
    enum: ['Adventure', 'Cultural', 'Leisure', 'Budget', 'Luxury', 'Solo', 'Family', ''],
    default: '',
  },
  interests:  { type: [String], default: [] },   // e.g. ['Temples', 'Photography']
  languages:  { type: [String], default: [] },   // e.g. ['Hindi', 'English']

  // ── Emergency contact (visible only to traveler themselves) ───────────────
  emergencyContact: {
    name:     { type: String, default: '' },
    phone:    { type: String, default: '' },
    relation: { type: String, default: '' },
  },

  // ── Social links (optional, public) ───────────────────────────────────────
  socialLinks: {
    instagram: { type: String, default: '' },
    website:   { type: String, default: '' },
  },

  // ── Future chat: when a guide gets chat access, their _id goes here ────────
  // chatApprovedGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;