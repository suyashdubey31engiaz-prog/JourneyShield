import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  // The guide who created and is hosting the tour
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  fixedDate: {
    type: Date,
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
    default: 10,
  },
  pricePerPerson: {
    type: Number,
    required: true,
  },
  // The travelers who are currently in the group
  travelers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // NEW: Tracks users kicked by the guide so they cannot rejoin, plus the reason
  kickedTravelers: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    reason: { 
      type: String, 
      required: true 
    }
  }],
  status: {
    type: String,
    enum: ['Open', 'Full', 'Completed', 'Cancelled'],
    default: 'Open',
  }
}, { timestamps: true });

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;