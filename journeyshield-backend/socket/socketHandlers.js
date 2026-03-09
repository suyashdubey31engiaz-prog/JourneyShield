import Message      from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import ChatLog      from '../models/chatLogModel.js';

export const registerSocketHandlers = (io, socket) => {
  const myId = socket.userId;

  socket.on('joinConversation',  ({ conversationId }) => socket.join(`conv:${conversationId}`));
  socket.on('leaveConversation', ({ conversationId }) => socket.leave(`conv:${conversationId}`));

  // ── Text message ──────────────────────────────────────────────────────────
  socket.on('sendMessage', async ({ conversationId, text }, ack) => {
    try {
      if (!text?.trim()) return;
      const conv = await Conversation.findOne({ _id: conversationId, participants: myId });
      if (!conv) return;
      const message   = await Message.create({ conversation: conversationId, sender: myId, text: text.trim(), type: 'text', readBy: [myId] });
      const populated = await message.populate('sender', 'name avatar');
      const otherId   = String(conv.participants.find(p => String(p) !== myId));
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: { text: text.trim(), sender: myId, createdAt: new Date() },
        updatedAt:   new Date(),
        $inc: { [`unreadCount.${otherId}`]: 1 },
      });
      ChatLog.findOneAndUpdate({ conversationId }, { lastActivityAt: new Date() }).catch(() => {});
      socket.to(`conv:${conversationId}`).emit('newMessage', { conversationId, message: populated });
      socket.to(otherId).emit('newMessage', { conversationId, message: populated });
      if (ack) ack({ ok: true, message: populated });
    } catch (err) {
      console.error('sendMessage error:', err);
      if (ack) ack({ ok: false, error: err.message });
    }
  });

  socket.on('typing',     ({ conversationId }) => socket.to(`conv:${conversationId}`).emit('userTyping',        { conversationId, userId: myId }));
  socket.on('stopTyping', ({ conversationId }) => socket.to(`conv:${conversationId}`).emit('userStoppedTyping', { conversationId, userId: myId }));

  socket.on('markRead', async ({ conversationId }) => {
    try {
      await Message.updateMany({ conversation: conversationId, readBy: { $ne: myId } }, { $addToSet: { readBy: myId } });
      await Conversation.findByIdAndUpdate(conversationId, { $set: { [`unreadCount.${myId}`]: 0 } });
      const conv = await Conversation.findById(conversationId);
      if (conv) {
        const otherId = String(conv.participants.find(p => String(p) !== myId));
        io.to(otherId).emit('messagesRead', { conversationId, byUserId: myId });
      }
    } catch (err) { console.error('markRead error:', err); }
  });
};