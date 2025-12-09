import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // The user who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // The guide who is being reviewed
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Guide',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;