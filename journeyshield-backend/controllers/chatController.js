import ChatRequest   from '../models/chatRequestModel.js';
import Conversation  from '../models/conversationModel.js';
import Message       from '../models/messageModel.js';
import User          from '../models/userModel.js';
import ChatLog       from '../models/chatLogModel.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT REQUEST ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const sendChatRequest = async (req, res) => {
  const { toUserId, message } = req.body;
  const fromUserId = req.user._id;
  if (String(fromUserId) === String(toUserId))
    return res.status(400).json({ message: 'Cannot send request to yourself.' });
  try {
    const existing = await Conversation.findOne({ participants: { $all: [fromUserId, toUserId] } });
    if (existing)
      return res.status(400).json({ message: 'You are already connected. Open the chat.' });
    const request = await ChatRequest.findOneAndUpdate(
      { from: fromUserId, to: toUserId },
      { status: 'pending', message: message || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getRequestStatus = async (req, res) => {
  const myId = req.user._id, otherId = req.params.toUserId;
  try {
    const convo = await Conversation.findOne({ participants: { $all: [myId, otherId] } });
    if (convo) return res.json({ status: 'connected', conversationId: convo._id });
    const sent     = await ChatRequest.findOne({ from: myId, to: otherId });
    const received = await ChatRequest.findOne({ from: otherId, to: myId });
    if (sent)     return res.json({ status: sent.status,     direction: 'sent',     request: sent     });
    if (received) return res.json({ status: received.status, direction: 'received', request: received });
    return res.json({ status: 'none' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({ to: req.user._id, status: 'pending' })
      .populate('from', 'name username avatar role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const respondToRequest = async (req, res) => {
  const { action } = req.body;
  try {
    const request = await ChatRequest.findById(req.params.requestId)
      .populate('from', 'name username avatar role')
      .populate('to',   'name username avatar role');
    if (!request)
      return res.status(404).json({ message: 'Request not found.' });
    if (String(request.to._id) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your request.' });
    request.status = action;
    await request.save();
    let conversation = null;
    if (action === 'approved') {
      conversation = await Conversation.findOne({ participants: { $all: [request.from._id, request.to._id] } });
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [request.from._id, request.to._id],
          unreadCount: {},
        });
      }
      ChatLog.findOneAndUpdate(
        { conversationId: conversation._id },
        { initiator: request.from._id, receiver: request.to._id, requestApprovedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).catch(() => {});
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name username avatar role');
    }
    const io = req.app.get('io');
    if (io) {
      const payload = { action, conversationId: conversation?._id || null, conversation: conversation || null };
      io.to(String(request.from._id)).emit('requestUpdate', payload);
      io.to(String(request.to._id)).emit('requestUpdate',   payload);
    }
    res.json({ request, conversation });
  } catch (err) {
    console.error('respondToRequest error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getConversations = async (req, res) => {
  const myId = req.user._id;
  try {
    const convos = await Conversation.find({ participants: myId })
      .populate('participants', 'name username avatar role')
      .sort({ updatedAt: -1 });
    const result = convos.map(c => {
      const obj     = c.toObject();
      obj.otherUser = obj.participants.find(p => String(p._id) !== String(myId));
      obj.myUnread  = obj.unreadCount?.[String(myId)] || 0;
      return obj;
    });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getMessages = async (req, res) => {
  const myId = req.user._id;
  const { conversationId } = req.params;
  const page  = parseInt(req.query.page  || 1);
  const limit = parseInt(req.query.limit || 40);
  try {
    const conv = await Conversation.findOne({ _id: conversationId, participants: myId });
    if (!conv) return res.status(403).json({ message: 'Not part of this conversation.' });
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name avatar')
      .populate('reactions.userId', 'name');
    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: myId } },
      { $addToSet: { readBy: myId } }
    );
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${String(myId)}`]: 0 }
    });
    res.json(messages.reverse());
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/chat/messages — REST path for ALL message types
// Text messages can also go via socket for speed, but all media goes here
export const sendMessage = async (req, res) => {
  const { conversationId, text, type, fileUrl, fileName, fileSize, duration, location } = req.body;
  const myId = req.user._id;
  try {
    const conv = await Conversation.findOne({ _id: conversationId, participants: myId });
    if (!conv) return res.status(403).json({ message: 'Not part of this conversation.' });

    // Build message data
    const msgData = {
      conversation: conversationId,
      sender:       myId,
      type:         type || 'text',
      readBy:       [myId],
    };
    if (text)     msgData.text     = text.trim();
    if (fileUrl)  { msgData.fileUrl = fileUrl; msgData.fileName = fileName || ''; msgData.fileSize = fileSize || 0; }
    if (duration) msgData.duration = duration;
    if (location) msgData.location = location;

    const message   = await Message.create(msgData);
    const populated = await message.populate('sender', 'name avatar');

    const otherId = conv.participants.find(p => String(p) !== String(myId));
    const preview = type === 'image' ? '📷 Image' : type === 'audio' ? '🎙️ Voice message' :
                    type === 'file'  ? `📎 ${fileName || 'File'}` : type === 'location' ? '📍 Location' :
                    (text || '').trim();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { text: preview, sender: myId, createdAt: new Date() },
      updatedAt:   new Date(),
      $inc: { [`unreadCount.${String(otherId)}`]: 1 },
    });

    ChatLog.findOneAndUpdate(
      { conversationId }, { lastActivityAt: new Date() }
    ).catch(() => {});

    // Emit to the conversation room (both participants get it via room)
    const io = req.app.get('io');
    if (io) {
      io.to(`conv:${conversationId}`).emit('newMessage', { conversationId, message: populated });
      io.to(String(otherId)).emit('newMessage', { conversationId, message: populated });
    }

    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Reactions ─────────────────────────────────────────────────────────────────
// POST /api/chat/messages/:messageId/react  { emoji }
export const reactToMessage = async (req, res) => {
  const { emoji } = req.body;
  const myId      = req.user._id;
  try {
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found.' });

    const idx = msg.reactions.findIndex(
      r => String(r.userId) === String(myId) && r.emoji === emoji
    );
    if (idx >= 0) {
      msg.reactions.splice(idx, 1); // toggle off
    } else {
      // Remove any other emoji from this user first (one reaction per user)
      msg.reactions = msg.reactions.filter(r => String(r.userId) !== String(myId));
      msg.reactions.push({ userId: myId, emoji });
    }
    await msg.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`conv:${String(msg.conversation)}`).emit('reactionUpdate', {
        messageId: msg._id,
        reactions: msg.reactions,
      });
    }
    res.json(msg.reactions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getTotalUnread = async (req, res) => {
  const myId = String(req.user._id);
  try {
    const convos = await Conversation.find({ participants: req.user._id });
    const total  = convos.reduce((sum, c) => sum + (c.unreadCount?.get(myId) || 0), 0);
    res.json({ count: total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};