import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // type determines how the bubble renders
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'file', 'location'],
    default: 'text',
  },

  // text — for 'text' type (optional if media)
  text: { type: String, default: '', maxlength: 2000 },

  // media — for 'image', 'audio', 'file' types
  fileUrl:   { type: String, default: '' },
  fileName:  { type: String, default: '' },
  fileSize:  { type: Number, default: 0 },   // bytes
  duration:  { type: Number, default: 0 },   // seconds, for audio

  // location — for 'location' type
  location: {
    lat:     Number,
    lng:     Number,
    address: { type: String, default: '' },
  },

  // reactions — array of { userId, emoji }  (one per user per emoji)
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji:  { type: String },
  }],

  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // 60-day TTL auto-delete
  expiresAt: { type: Date, default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },

}, { timestamps: true });

messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Message', messageSchema);