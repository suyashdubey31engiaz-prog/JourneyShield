import mongoose from 'mongoose';

// A chat request is sent by a traveler to a guide (or vice versa).
// Both must approve before a Conversation is created.
const chatRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // pending → approved → (Conversation created)  |  rejected
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  // short message shown with the request (optional)
  message: { type: String, default: '', maxlength: 300 },

}, { timestamps: true });

// Prevent duplicate requests between same pair
chatRequestSchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.model('ChatRequest', chatRequestSchema);