import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  // This links the guide profile to a user account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // This refers to our 'User' model
  },
  location: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  reviews: {
    type: Number,
    required: true,
    default: 0,
  }
}, {
  timestamps: true,
});

const Guide = mongoose.model('Guide', guideSchema);

export default Guide;