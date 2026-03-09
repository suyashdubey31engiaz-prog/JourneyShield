import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendChatRequest, getRequestStatus, getPendingRequests, respondToRequest,
  getConversations, getMessages, sendMessage, reactToMessage, getTotalUnread,
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/request',                       protect, sendChatRequest);
router.get('/request/status/:toUserId',       protect, getRequestStatus);
router.get('/requests/pending',               protect, getPendingRequests);
router.put('/request/:requestId',             protect, respondToRequest);

router.get('/conversations',                  protect, getConversations);

router.get('/messages/:conversationId',       protect, getMessages);
router.post('/messages',                      protect, sendMessage);
router.post('/messages/:messageId/react',     protect, reactToMessage);

router.get('/unread-count',                   protect, getTotalUnread);

export default router;