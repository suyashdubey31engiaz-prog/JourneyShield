import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import chatService from '../services/chatService';

const SOCKET_URL    = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ── Upload any file/audio/image to Cloudinary ─────────────────────────────────
const uploadToCloudinary = async (file) => {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return { url: data.secure_url, bytes: data.bytes, format: data.format, duration: data.duration };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const fmt = (d) => {
  if (!d) return '';
  const dt = new Date(d), now = new Date();
  if (dt.toDateString() === now.toDateString())
    return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const fmtSize = (b) => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${Math.round(b/1024)} KB`;

const Avatar = ({ user, size = 'md' }) => {
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size];
  return (
    <div className={`${sz} rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-cyan-700 to-blue-900 flex items-center justify-center font-extrabold text-white border border-gray-700`}>
      {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : initials(user?.name)}
    </div>
  );
};

// ── Emoji Reaction Picker ─────────────────────────────────────────────────────
const EMOJIS = ['👍','❤️','😂','😮','😢','🙏','🔥','✈️'];
const EmojiPicker = ({ onPick, onClose }) => (
  <div className="absolute bottom-full mb-1 left-0 z-30 flex gap-1 bg-gray-800 border border-gray-700 rounded-2xl px-2 py-1.5 shadow-xl">
    {EMOJIS.map(e => (
      <button key={e} onClick={() => { onPick(e); onClose(); }}
        className="text-lg hover:scale-125 transition-transform w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-700">
        {e}
      </button>
    ))}
  </div>
);

// ── Message Bubble ────────────────────────────────────────────────────────────
const Bubble = ({ msg, isMe, myId, onReact }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Group reactions by emoji
  const reactionMap = {};
  (msg.reactions || []).forEach(r => {
    const emoji = r.emoji;
    if (!reactionMap[emoji]) reactionMap[emoji] = { count: 0, mine: false };
    reactionMap[emoji].count++;
    if (String(r.userId?._id || r.userId) === String(myId)) reactionMap[emoji].mine = true;
  });
  const reactionEntries = Object.entries(reactionMap);

  return (
    <div className={`flex items-end gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && <Avatar user={msg.sender} size="sm" />}

      <div className="max-w-[72%] flex flex-col gap-1">
        {/* Bubble */}
        <div className={`relative group rounded-2xl shadow-md overflow-hidden ${
          isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
        } ${
          isMe ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-100 border border-gray-700'
        }`}>

          {/* React button on hover */}
          <button onClick={() => setShowPicker(v => !v)}
            className={`absolute top-1 ${isMe ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity text-xs w-6 h-6 rounded-full flex items-center justify-center z-10
              ${isMe ? 'bg-yellow-600/50 text-black' : 'bg-gray-700 text-gray-300'}`}>
            😊
          </button>
          {showPicker && (
            <div className={`absolute ${isMe ? 'right-full mr-1' : 'left-full ml-1'} top-0 z-30`}>
              <EmojiPicker onPick={(e) => onReact(msg._id, e)} onClose={() => setShowPicker(false)} />
            </div>
          )}

          {/* Content by type */}
          {msg.type === 'text' && (
            <p className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
          )}

          {msg.type === 'image' && (
            <a href={msg.fileUrl} target="_blank" rel="noreferrer">
              <img src={msg.fileUrl} alt="shared" className="max-w-xs w-full max-h-64 object-cover cursor-zoom-in hover:opacity-90 transition-opacity" />
              {msg.text && <p className="px-3 py-2 text-sm">{msg.text}</p>}
            </a>
          )}

          {msg.type === 'audio' && (
            <div className="px-3 py-2.5 flex items-center gap-3 min-w-[200px]">
              <span className="text-xl">🎙️</span>
              <audio controls src={msg.fileUrl}
                className="h-8 w-full"
                style={{ filter: isMe ? 'invert(1) sepia(1) saturate(0)' : 'none' }} />
              {msg.duration > 0 && (
                <span className="text-[11px] opacity-70 shrink-0">
                  {Math.floor(msg.duration)}s
                </span>
              )}
            </div>
          )}

          {msg.type === 'file' && (
            <a href={msg.fileUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${isMe ? 'bg-yellow-600/30' : 'bg-gray-700'}`}>
                📄
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate max-w-[160px]">{msg.fileName || 'Document'}</p>
                <p className="text-[11px] opacity-60">{msg.fileSize ? fmtSize(msg.fileSize) : 'PDF'}</p>
              </div>
              <span className="text-lg ml-auto shrink-0">↓</span>
            </a>
          )}

          {msg.type === 'location' && (
            <a href={`https://www.google.com/maps?q=${msg.location?.lat},${msg.location?.lng}`}
              target="_blank" rel="noreferrer"
              className="block hover:opacity-90 transition-opacity">
              <div className={`relative w-full h-28 flex items-center justify-center text-5xl ${isMe ? 'bg-yellow-600/20' : 'bg-gray-700'}`}>
                <img
                  src={`https://static-maps.yandex.ru/1.x/?ll=${msg.location?.lng},${msg.location?.lat}&z=14&size=450,180&l=map&pt=${msg.location?.lng},${msg.location?.lat},pm2rdm`}
                  alt="map"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="absolute text-3xl drop-shadow-lg">📍</span>
              </div>
              <p className="px-3 py-2 text-xs font-semibold truncate">{msg.location?.address || 'Shared location — tap to open'}</p>
            </a>
          )}
        </div>

        {/* Reactions row */}
        {reactionEntries.length > 0 && (
          <div className={`flex gap-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
            {reactionEntries.map(([emoji, { count, mine }]) => (
              <button key={emoji} onClick={() => onReact(msg._id, emoji)}
                className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-all
                  ${mine ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                <span>{emoji}</span>
                {count > 1 && <span className="font-bold">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp + read receipt */}
        <p className={`text-[10px] text-gray-600 ${isMe ? 'text-right' : 'text-left'}`}>
          {fmt(msg.createdAt)}
          {isMe && msg.readBy?.length > 1 && <span className="ml-1 text-cyan-500">✓✓</span>}
        </p>
      </div>
    </div>
  );
};

// ── Sidebar conversation item ─────────────────────────────────────────────────
const ConvItem = ({ conv, active, onClick }) => {
  const other  = conv.otherUser;
  const unread = conv.myUnread || 0;
  const last   = conv.lastMessage;
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-800/60 border-b border-gray-800/60 ${active ? 'bg-gray-800/80 border-l-2 border-l-yellow-500' : ''}`}>
      <div className="relative shrink-0">
        <Avatar user={other} size="md" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-[10px] font-extrabold rounded-full flex items-center justify-center shadow">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-bold truncate ${active ? 'text-yellow-400' : 'text-white'}`}>{other?.name || 'Unknown'}</p>
          {last?.createdAt && <span className="text-[10px] text-gray-500 shrink-0">{fmt(last.createdAt)}</span>}
        </div>
        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-gray-200 font-semibold' : 'text-gray-500'}`}>
          {last?.text || 'Start the conversation…'}
        </p>
      </div>
    </button>
  );
};

const DateSep = ({ date }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-gray-800" />
    <span className="text-[11px] text-gray-500 font-semibold px-2">
      {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
    </span>
    <div className="flex-1 h-px bg-gray-800" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CHAT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const Chat = () => {
  const user           = JSON.parse(sessionStorage.getItem('user'));
  const myId           = String(user?._id || '');
  const [searchParams] = useSearchParams();

  const socketRef      = useRef(null);
  const [socketReady,  setSocketReady]  = useState(false);

  const [conversations, setConversations] = useState([]);
  const [activeConvId,  setActiveConvId]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [text,          setText]          = useState('');
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [uploadLabel,   setUploadLabel]   = useState('');
  const [otherTyping,   setOtherTyping]   = useState(false);
  const [pendingReqs,   setPendingReqs]   = useState([]);
  const [showRequests,  setShowRequests]  = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [attachOpen,    setAttachOpen]    = useState(false);

  // Recording state
  const [isRecording,  setIsRecording]   = useState(false);
  const [recDuration,  setRecDuration]   = useState(0);
  const mediaRecRef    = useRef(null);
  const recChunksRef   = useRef([]);
  const recTimerRef    = useRef(null);

  // Call state

  const bottomRef      = useRef(null);
  const typingTimer    = useRef(null);
  const activeConvRef  = useRef(null);
  const fileInputRef   = useRef(null);
  const pdfInputRef    = useRef(null);

  const activeConv  = conversations.find(c => c._id === activeConvId);
  const otherUser   = activeConv?.otherUser;

  useEffect(() => { activeConvRef.current = activeConvId; }, [activeConvId]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await chatService.getConversations();
      setConversations(data);
      return data;
    } catch { return []; }
  }, []);

  const fetchPending = useCallback(async () => {
    try { const { data } = await chatService.getPendingRequests(); setPendingReqs(data); } catch {}
  }, []);

  // ── Open conversation ──────────────────────────────────────────────────────
  const openConversation = useCallback(async (convId) => {
    if (activeConvRef.current && socketRef.current)
      socketRef.current.emit('leaveConversation', { conversationId: activeConvRef.current });
    setActiveConvId(convId);
    setMessages([]);
    setOtherTyping(false);
    if (socketRef.current) socketRef.current.emit('joinConversation', { conversationId: convId });
    try {
      const { data } = await chatService.getMessages(convId);
      setMessages(data);
      socketRef.current?.emit('markRead', { conversationId: convId });
      setConversations(prev => prev.map(c => c._id === convId ? { ...c, myUnread: 0 } : c));
    } catch (err) { console.error(err); }
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const data = await fetchConversations();
      await fetchPending();
      setLoading(false);
      const p = searchParams.get('conv');
      if (p && data.some(c => c._id === p)) openConversation(p);
      else if (data.length > 0) openConversation(data[0]._id);
    };
    init();
  }, []);

  // ── Socket init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = io(SOCKET_URL, {
      auth:                  { token: user?.token },
      transports:            ['websocket', 'polling'],
      reconnection:          true,
      reconnectionDelay:     1000,
      reconnectionDelayMax:  5000,
      reconnectionAttempts:  10,
      timeout:               20000,
      // Force polling first on localhost — WebSocket upgrade sometimes fails
      // during dev server hot-reload cycles
      upgrade:               true,
    });
    s.on('connect',       () => { setSocketReady(true);  if (activeConvRef.current) s.emit('joinConversation', { conversationId: activeConvRef.current }); });
    s.on('disconnect',    () => setSocketReady(false));
    s.on('connect_error', (e) => console.error('Socket:', e.message));

    // Store caller info on socket for call events
    s.callerName   = user?.name;
    s.callerAvatar = user?.avatar;

    socketRef.current = s;
    return () => { s.disconnect(); socketRef.current = null; };
  }, []);

  // ── Socket event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onNewMessage = ({ conversationId, message }) => {
      const cur = activeConvRef.current;
      if (conversationId === cur) {
        setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, message]);
        s.emit('markRead', { conversationId });
      }
      setConversations(prev =>
        prev.map(c => c._id === conversationId
          ? { ...c, lastMessage: { text: message.text || '', createdAt: message.createdAt }, myUnread: conversationId === cur ? 0 : (c.myUnread || 0) + 1 }
          : c
        ).sort((a, b) => new Date(b.lastMessage?.createdAt || b.updatedAt) - new Date(a.lastMessage?.createdAt || a.updatedAt))
      );
    };

    const onReactionUpdate = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    };

    const onRequestUpdate = ({ action, conversation }) => {
      if (action === 'approved' && conversation) {
        const populated = { ...conversation, otherUser: (conversation.participants || []).find(p => String(p._id || p) !== myId), myUnread: 0 };
        setConversations(prev => prev.some(c => c._id === conversation._id) ? prev : [populated, ...prev]);
        setPendingReqs(prev => prev.filter(r => String(r.from?._id) !== String(populated.otherUser?._id)));
        setShowRequests(false);
        openConversation(conversation._id);
      }
    };

    const onTyping       = ({ conversationId }) => { if (conversationId === activeConvRef.current) setOtherTyping(true); };
    const onStopTyping   = ({ conversationId }) => { if (conversationId === activeConvRef.current) setOtherTyping(false); };
    const onMessagesRead = ({ conversationId }) => {
      if (conversationId === activeConvRef.current)
        setMessages(prev => prev.map(m => String(m.sender?._id || m.sender) === myId ? { ...m, readBy: [...new Set([...(m.readBy || []), 'other'])] } : m));
    };

    s.on('newMessage',        onNewMessage);
    s.on('reactionUpdate',    onReactionUpdate);
    s.on('requestUpdate',     onRequestUpdate);
    s.on('userTyping',        onTyping);
    s.on('userStoppedTyping', onStopTyping);
    s.on('messagesRead',      onMessagesRead);

    return () => {
      s.off('newMessage',        onNewMessage);
      s.off('reactionUpdate',    onReactionUpdate);
      s.off('requestUpdate',     onRequestUpdate);
      s.off('userTyping',        onTyping);
      s.off('userStoppedTyping', onStopTyping);
      s.off('messagesRead',      onMessagesRead);
    };
  }, [socketReady]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, otherTyping]);

  // ── Send text ──────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeConvId || sending) return;
    setText('');
    setSending(true);
    const optimistic = { _id: `opt-${Date.now()}`, sender: { _id: myId, name: user?.name, avatar: user?.avatar }, text: trimmed, type: 'text', readBy: [myId], createdAt: new Date().toISOString() };
    setMessages(p => [...p, optimistic]);
    try {
      const s = socketRef.current;
      if (s?.connected) {
        s.emit('sendMessage', { conversationId: activeConvId, text: trimmed }, (res) => {
          if (res?.ok && res.message) setMessages(p => p.map(m => m._id === optimistic._id ? res.message : m));
        });
      } else {
        const { data } = await chatService.sendMessage(activeConvId, trimmed);
        setMessages(p => p.map(m => m._id === optimistic._id ? data : m));
      }
    } catch {
      setMessages(p => p.filter(m => m._id !== optimistic._id));
      setText(trimmed);
    } finally {
      setSending(false);
      clearTimeout(typingTimer.current);
      socketRef.current?.emit('stopTyping', { conversationId: activeConvId });
    }
  };

  // ── Send media via REST ─────────────────────────────────────────────────────
  const sendMediaMessage = async (payload) => {
    try {
      const { data } = await chatService.sendMessage(activeConvId, null, payload);
      setMessages(p => [...p, data]);
    } catch (err) { console.error('sendMediaMessage error:', err); }
  };

  // ── Upload image ───────────────────────────────────────────────────────────
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;
    setAttachOpen(false);
    setUploading(true); setUploadLabel('Uploading image…');
    try {
      const { url, bytes } = await uploadToCloudinary(file);
      await sendMediaMessage({ type: 'image', fileUrl: url, fileSize: bytes, fileName: file.name });
    } catch (err) { alert('Image upload failed: ' + err.message); }
    finally { setUploading(false); e.target.value = ''; }
  };

  // ── Upload PDF ─────────────────────────────────────────────────────────────
  const handlePdfFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;
    setAttachOpen(false);
    setUploading(true); setUploadLabel('Uploading document…');
    try {
      const { url, bytes } = await uploadToCloudinary(file);
      await sendMediaMessage({ type: 'file', fileUrl: url, fileSize: bytes, fileName: file.name });
    } catch (err) { alert('File upload failed: ' + err.message); }
    finally { setUploading(false); e.target.value = ''; }
  };

  // ── Share location ─────────────────────────────────────────────────────────
  const handleLocation = () => {
    setAttachOpen(false);
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
    setUploading(true); setUploadLabel('Getting location…');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const d = await r.json();
        address = d.display_name?.split(',').slice(0, 3).join(', ') || address;
      } catch {}
      try {
        await sendMediaMessage({ type: 'location', location: { lat, lng, address } });
      } finally { setUploading(false); }
    }, () => { setUploading(false); alert('Could not get your location. Check browser permissions.'); });
  };

  // ── Voice recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec    = new MediaRecorder(stream);
      mediaRecRef.current  = rec;
      recChunksRef.current = [];
      rec.ondataavailable  = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      rec.start();
      setIsRecording(true);
      setRecDuration(0);
      recTimerRef.current = setInterval(() => setRecDuration(d => d + 1), 1000);
    } catch { alert('Microphone access denied.'); }
  };

  const stopRecording = () => {
    const rec = mediaRecRef.current;
    if (!rec) return;
    clearInterval(recTimerRef.current);
    setIsRecording(false);

    rec.onstop = async () => {
      const blob = new Blob(recChunksRef.current, { type: 'audio/webm' });
      rec.stream.getTracks().forEach(t => t.stop());
      setUploading(true); setUploadLabel('Uploading voice message…');
      try {
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        const { url, bytes, duration } = await uploadToCloudinary(file);
        await sendMediaMessage({ type: 'audio', fileUrl: url, fileSize: bytes, duration: duration || recDuration, fileName: 'Voice message' });
      } catch (err) { alert('Audio upload failed: ' + err.message); }
      finally { setUploading(false); }
    };
    rec.stop();
  };

  // ── Reactions ──────────────────────────────────────────────────────────────
  const handleReact = async (messageId, emoji) => {
    try {
      const { data: reactions } = await chatService.reactToMessage(messageId, emoji);
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    } catch (err) { console.error('react error:', err); }
  };

  // ── Typing ─────────────────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setText(e.target.value);
    const s = socketRef.current;
    if (!s || !activeConvId) return;
    s.emit('typing', { conversationId: activeConvId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => s.emit('stopTyping', { conversationId: activeConvId }), 1500);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  // ── Pending requests ───────────────────────────────────────────────────────
  const handleRespond = async (requestId, action) => {
    try {
      await chatService.respondToRequest(requestId, action);
      setPendingReqs(p => p.filter(r => r._id !== requestId));
    } catch (err) { alert(err.response?.data?.message || 'Action failed.'); }
  };

  const shouldShowDate = (msg, prev) => !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();

  // ────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-950">
      <svg className="animate-spin w-10 h-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-950 overflow-hidden text-white">

      {/* ── Hidden file inputs ─────────────────────────────────────────────── */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      <input ref={pdfInputRef}  type="file" accept=".pdf,application/pdf" className="hidden" onChange={handlePdfFile} />

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-800 shrink-0`}>
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-white">Messages</h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${socketReady ? 'bg-green-500' : 'bg-red-500'}`} />
              {socketReady ? 'Live' : 'Connecting…'}
            </p>
          </div>
          {pendingReqs.length > 0 && (
            <button onClick={() => setShowRequests(v => !v)}
              className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-700/50 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
              🔔 Requests
              <span className="w-5 h-5 bg-yellow-500 text-black text-[10px] font-extrabold rounded-full flex items-center justify-center">{pendingReqs.length}</span>
            </button>
          )}
        </div>

        {showRequests && pendingReqs.length > 0 && (
          <div className="border-b border-gray-800 bg-gray-900/80">
            {pendingReqs.map(req => (
              <div key={req._id} className="flex items-start gap-3 p-4 border-b border-gray-800/60 last:border-0">
                <Avatar user={req.from} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{req.from?.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{req.from?.role}</p>
                  {req.message && <p className="text-gray-400 text-xs mt-1 italic">"{req.message}"</p>}
                  <div className="flex gap-2 mt-2.5">
                    <button onClick={() => handleRespond(req._id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1.5 rounded-lg transition-all">✅ Accept</button>
                    <button onClick={() => handleRespond(req._id, 'rejected')} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold py-1.5 rounded-lg transition-all">✕ Decline</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="text-5xl mb-4">🤝</div>
              <p className="text-white font-bold text-base mb-2">No chats yet</p>
              <p className="text-gray-500 text-xs leading-relaxed">Go to a guide's profile and send a chat request.</p>
            </div>
          ) : conversations.map(conv => (
            <ConvItem key={conv._id} conv={conv} active={conv._id === activeConvId} onClick={() => openConversation(conv._id)} />
          ))}
        </div>
      </div>

      {/* ── CHAT WINDOW ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConvId && otherUser ? (
          <>
            {/* Header */}
            <div className="shrink-0 px-4 py-3 bg-gray-900 border-b border-gray-800 flex items-center gap-3 shadow-sm">
              <button onClick={() => setSidebarOpen(true)}
                className="md:hidden w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white shrink-0">←</button>
              <Avatar user={otherUser} size="md" />
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-extrabold text-sm truncate">{otherUser.name}</h2>
                <p className="text-xs truncate">
                  {otherTyping
                    ? <span className="text-green-400 font-semibold animate-pulse">typing…</span>
                    : <span className="text-gray-500 capitalize">{otherUser.role}</span>}
                </p>
              </div>            </div>

            {/* Uploading indicator */}
            {uploading && (
              <div className="shrink-0 bg-yellow-500/10 border-b border-yellow-700/30 px-5 py-2 flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span className="text-yellow-400 text-xs font-semibold">{uploadLabel}</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-950"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1f2937 1px, transparent 0)', backgroundSize: '40px 40px' }}>
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-5 border border-gray-700">💬</div>
                  <p className="text-white font-extrabold text-lg mb-2">Start chatting with {otherUser.name}</p>
                  <p className="text-gray-500 text-sm max-w-xs">You're connected! Ask about tours, share plans, and coordinate your trip.</p>
                </div>
              ) : messages.map((msg, i) => (
                <React.Fragment key={msg._id}>
                  {shouldShowDate(msg, messages[i-1]) && <DateSep date={msg.createdAt} />}
                  <Bubble msg={msg} isMe={String(msg.sender?._id || msg.sender) === myId} myId={myId} onReact={handleReact} />
                </React.Fragment>
              ))}

              {otherTyping && (
                <div className="flex items-end gap-2 mt-1">
                  <Avatar user={otherUser} size="sm" />
                  <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── INPUT BAR ─────────────────────────────────────────────────── */}
            <div className="shrink-0 px-4 py-3 bg-gray-900 border-t border-gray-800">
              <div className="flex items-end gap-2">

                {/* Attachment menu */}
                <div className="relative shrink-0">
                  <button onClick={() => setAttachOpen(v => !v)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-all mb-0.5
                      ${attachOpen ? 'bg-yellow-500/20 border-yellow-600 text-yellow-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}>
                    📎
                  </button>

                  {attachOpen && (
                    <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-2xl py-2 shadow-2xl w-44 z-20">
                      <button onClick={() => { fileInputRef.current?.click(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/60 transition-all text-sm text-gray-200 font-semibold">
                        <span className="text-xl">🖼️</span> Image
                      </button>
                      <button onClick={() => { pdfInputRef.current?.click(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/60 transition-all text-sm text-gray-200 font-semibold">
                        <span className="text-xl">📄</span> PDF Document
                      </button>
                      <button onClick={handleLocation}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/60 transition-all text-sm text-gray-200 font-semibold">
                        <span className="text-xl">📍</span> Share Location
                      </button>
                    </div>
                  )}
                </div>

                {/* Text input */}
                <div className="flex-1 flex items-end bg-gray-800 border border-gray-700 rounded-2xl px-3 py-2 focus-within:border-yellow-500/50 transition-all gap-2">
                  <textarea value={text} onChange={handleTyping} onKeyDown={handleKey}
                    placeholder="Type a message…" rows={1}
                    className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none outline-none max-h-32 py-1.5 leading-relaxed"
                    style={{ scrollbarWidth: 'none' }} />
                  <button onClick={handleSend} disabled={!text.trim() || sending}
                    className="w-8 h-8 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 flex items-center justify-center text-black transition-all shrink-0 shadow-md shadow-yellow-500/20">
                    {sending
                      ? <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/></svg>
                    }
                  </button>
                </div>

                {/* Voice record button */}
                <button
                  onMouseDown={startRecording} onMouseUp={stopRecording}
                  onTouchStart={startRecording} onTouchEnd={stopRecording}
                  disabled={uploading}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-all mb-0.5 shrink-0
                    ${isRecording ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}
                  title="Hold to record voice message">
                  {isRecording ? `${recDuration}s` : '🎙️'}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 text-center mt-1.5">Enter to send · Shift+Enter for new line · Hold 🎙️ for voice</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-24 h-24 bg-gray-800/80 rounded-3xl flex items-center justify-center text-5xl mb-6 border border-gray-700/60 shadow-xl">🗺️</div>
            <h2 className="text-white font-extrabold text-xl mb-2">Your Chats</h2>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">Select a conversation or go to a guide's profile to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
//--- File: C:\Users\Suyash Dubey\OneDrive\Desktop\SafeJourney\journeyshield-frontend\src\pages\Dashboard.jsx ---