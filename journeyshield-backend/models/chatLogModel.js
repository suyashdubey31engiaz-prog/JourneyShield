import mongoose from 'mongoose';

// Permanent security log — survives after messages are deleted.
// Stores ONLY: who sent the first message, to whom, when, conversation ID.
// No message content is ever stored here.
const chatLogSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, unique: true },
  initiator:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // who sent the chat request
  receiver:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // who approved it
  requestApprovedAt: { type: Date, default: Date.now },
  lastActivityAt:    { type: Date, default: Date.now },  // updated on every message, no content
}, { timestamps: true });

export default mongoose.model('ChatLog', chatLogSchema);