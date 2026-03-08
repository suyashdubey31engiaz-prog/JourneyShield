import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

  // ── Profile picture (Cloudinary URL) ──────────────────────────────────────
  avatar: { type: String, default: '' },

  // ── Core fields ────────────────────────────────────────────────────────────
  bio:      { type: String, default: '' },
  location: { type: String, default: '' },

  // ── Professional details ───────────────────────────────────────────────────
  experience:     { type: String, default: '' },   // e.g. '5 years'
  languages:      { type: [String], default: [] },
  specialties:    { type: [String], default: [] },
  phone:          { type: String,  default: '' },  // visible only after chat approval
  availability:   { type: String, default: '' },
  pricePerHour:   { type: Number,  default: 0 },
  certifications: { type: String,  default: '' },

  // ── Social links ───────────────────────────────────────────────────────────
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    website:   { type: String, default: '' },
  },

  // ── Rating (recomputed on each review) ────────────────────────────────────
  rating:  { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },

}, { timestamps: true });

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;