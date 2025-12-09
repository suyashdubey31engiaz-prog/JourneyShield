import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Traveler', 'Guide'] },
  // New field to track verification status
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;