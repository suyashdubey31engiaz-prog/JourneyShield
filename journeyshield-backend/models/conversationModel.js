import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  // Always exactly 2 participants
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],

  // Denormalised for fast sidebar queries
  lastMessage: {
    text:      { type: String,  default: '' },
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date },
  },

  // Track unread count per participant  { userId: count }
  unreadCount: { type: Map, of: Number, default: {} },

}, { timestamps: true });

conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);