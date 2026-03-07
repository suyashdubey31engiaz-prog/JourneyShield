import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  // Links the guide profile to a user account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },

  // ── Core Info ────────────────────────────────────────────────────────────────
  location: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },

  // ── Extended Profile Fields ──────────────────────────────────────────────────
  // e.g. "5 years", "10+ years"
  experience: {
    type: String,
    default: '',
  },
  // e.g. ["English", "Hindi", "French"]
  languages: {
    type: [String],
    default: [],
  },
  // e.g. ["Heritage Tours", "Adventure", "Food Tours", "Photography"]
  specialties: {
    type: [String],
    default: [],
  },
  // Contact number (optional - guide decides to share or not)
  phone: {
    type: String,
    default: '',
  },
  // e.g. "Weekdays", "Weekends", "Full-time", "By Appointment"
  availability: {
    type: String,
    enum: ['Full-time', 'Weekdays', 'Weekends', 'By Appointment', ''],
    default: '',
  },
  // Hourly rate in USD
  pricePerHour: {
    type: Number,
    default: 0,
  },
  // e.g. "Certified Tour Guide (India Tourism Ministry, 2020)"
  certifications: {
    type: String,
    default: '',
  },
  // Social / contact links
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    website:   { type: String, default: '' },
  },

  // ── Calculated Stats (updated by reviewController) ──────────────────────────
  rating: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;