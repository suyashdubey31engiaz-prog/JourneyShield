import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
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
  // How many times the traveler has edited this review (0 = never edited after first submission)
  editCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true, // createdAt = first review date, updatedAt = last edit date
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;