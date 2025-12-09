import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  notes: {
    type: String,
    default: '',
  },
  // NEW FIELD: Tracks if this specific trip was used to leave/update a review
  isReviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;