import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/chat';

const auth = () => {
  const u = JSON.parse(sessionStorage.getItem('user'));
  return u?.token ? { headers: { Authorization: `Bearer ${u.token}` } } : {};
};

const chatService = {
  sendRequest:        (toUserId, message)  => axios.post(`${BASE}/request`,            { toUserId, message },  auth()),
  getRequestStatus:   (toUserId)           => axios.get(`${BASE}/request/status/${toUserId}`,                  auth()),
  getPendingRequests: ()                   => axios.get(`${BASE}/requests/pending`,                            auth()),
  respondToRequest:   (requestId, action)  => axios.put(`${BASE}/request/${requestId}`, { action },            auth()),

  getConversations:   ()                   => axios.get(`${BASE}/conversations`,                               auth()),

  getMessages:  (conversationId, page = 1) => axios.get(`${BASE}/messages/${conversationId}?page=${page}`,     auth()),
  sendMessage:  (conversationId, text, extra = {}) =>
    axios.post(`${BASE}/messages`, { conversationId, text, ...extra }, auth()),

  reactToMessage: (messageId, emoji) =>
    axios.post(`${BASE}/messages/${messageId}/react`, { emoji }, auth()),

  getUnreadCount: () => axios.get(`${BASE}/unread-count`, auth()),
};

export default chatService;