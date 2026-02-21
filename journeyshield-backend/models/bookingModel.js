import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // The user who is making the booking (the main traveler)
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The guide being hired
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  // The specific date the traveler wants to hire the guide
  date: {
    type: Date,
    required: true,
  },
  // NEW: Determines if this is a solo booking or a private group
  isPrivateGroup: {
    type: Boolean,
    default: false
  },
  // NEW: The list of people the traveler is bringing with them
  groupMembers: [{
    name: { 
      type: String, 
      required: true 
    },
    age: { 
      type: Number 
    },
    notes: { 
      type: String 
      // Example: "Allergic to peanuts", "Uses a wheelchair", etc.
    }
  }]
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;