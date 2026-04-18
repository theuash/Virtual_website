import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search, Plus, X, Loader2, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import api from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return 'now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// ── Avatar ────────────────────────────────────────────────────────
function Avatar({ name, size = 9 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-black shrink-0`}
      style={{ background: 'var(--accent)', color: '#fff' }}
    >
      {getInitials(name)}
    </div>
  );
}

// ── Conversation list item ────────────────────────────────────────
function ConvItem({ conv, isActive, onClick, currentUserId }) {
  const other = conv.lastMessage;
  const name  = conv.name || `Conversation`;
  const preview = conv.lastMessage?.content || 'No messages yet';
  const time    = conv.lastMessage?.createdAt ? timeAgo(conv.lastMessage.createdAt) : '';
  const unread  = conv.unreadCount ?? 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
      style={{
        background: isActive ? 'var(--bg-card)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      <Avatar name={name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {name}
          </span>
          <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {preview}
          </p>
          {unread > 0 && (
            <span
              className="ml-2 shrink-0 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────
function MessageBubble({ msg, isMine }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
        style={{
          background:   isMine ? 'var(--accent)' : 'var(--bg-card)',
          color:        isMine ? '#fff' : 'var(--text-primary)',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
      >
        <p style={{ wordBreak: 'break-word' }}>{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[9px]" style={{ color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>
            {timeAgo(msg.createdAt)}
          </span>
          {isMine && (
            msg.isRead
              ? <CheckCheck size={10} style={{ color: 'rgba(255,255,255,0.7)' }} />
              : <Check size={10} style={{ color: 'rgba(255,255,255,0.5)' }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── New conversation modal ────────────────────────────────────────
function NewConvModal({ onClose, onCreated, currentUserId }) {
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleCreate = async () => {
    if (!recipientId.trim()) return setError('Enter a user ID');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/messaging/conversations', {
        type: 'dm',
        members: [recipientId.trim()],
      });
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>New Message</h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={recipientId}
            onChange={e => setRecipientId(e.target.value)}
            placeholder="Paste user ID…"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {loading ? 'Creating…' : 'Start Conversation'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main MessagingUI ──────────────────────────────────────────────
export default function MessagingUI({ initialConvId = null }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [activeConvId,  setActiveConvId]  = useState(initialConvId);
  const [convsLoading,  setConvsLoading]  = useState(true);
  const [input,         setInput]         = useState('');
  const [showNewConv,   setShowNewConv]   = useState(false);
  const [search,        setSearch]        = useState('');
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const { messages, sendMessage, isConnected, isTyping, sendTyping, error: socketError } =
    useChat(activeConvId, user?.token);

  // ── Load conversations ────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('/messaging/conversations');
      const list = res.data.data ?? [];
      setConversations(list);

      // If an initialConvId was given but isn't in the list yet, add a placeholder
      // so the sidebar shows it. The real data arrives via socket.
      if (initialConvId && !list.find(c => c._id === initialConvId)) {
        try {
          const convRes = await api.get(`/messaging/conversations`);
          // Already fetched — just set active
        } catch { /* silent */ }
      }
    } catch {
      // silent
    } finally {
      setConvsLoading(false);
    }
  }, [initialConvId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Auto-select first conversation ONLY if no initialConvId was provided
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0]._id);
    }
  }, [conversations, activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update conversation list when a new message arrives
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    setConversations(prev =>
      prev.map(c =>
        c._id === activeConvId
          ? { ...c, lastMessage: last, unreadCount: 0 }
          : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  }, [messages, activeConvId]);

  // ── Send ──────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;
    sendMessage(input.trim());
    setInput('');
    sendTyping(false);
  };

  // ── Typing indicator ──────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendTyping(false), 1500);
  };

  const activeConv = conversations.find(c => c._id === activeConvId);
  const filtered   = conversations.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="flex h-[calc(100vh-80px)] overflow-hidden rounded-xl border"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div
        className="w-72 shrink-0 flex flex-col border-r"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Messages</h2>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: isConnected ? '#10b981' : '#ef4444' }}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
            <button
              onClick={() => setShowNewConv(true)}
              className="p-1.5 rounded-lg border transition-all hover:scale-105"
              style={{ borderColor: 'var(--border)', color: 'var(--accent)', background: 'var(--bg-card)' }}
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
            <Search size={13} strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} strokeWidth={1.5} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare size={28} strokeWidth={1} className="mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {search ? 'No conversations match.' : 'No conversations yet. Start one with the + button.'}
              </p>
            </div>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv._id}
                conv={conv}
                isActive={conv._id === activeConvId}
                onClick={() => setActiveConvId(conv._id)}
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Chat area ────────────────────────────────────────── */}
      {activeConvId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <Avatar name={activeConv?.name || 'Chat'} />
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {activeConv?.name || 'Conversation'}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                {isTyping ? (
                  <span style={{ color: 'var(--accent)' }}>typing…</span>
                ) : (
                  isConnected ? 'Online' : 'Connecting…'
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare size={32} strokeWidth={1} className="mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map(msg => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  isMine={msg.senderId?.toString() === currentUserId?.toString()}
                />
              ))
            )}
            {/* Typing indicator bubble */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="flex justify-start mb-2"
                >
                  <div
                    className="px-4 py-2.5 rounded-2xl flex items-center gap-1"
                    style={{ background: 'var(--bg-card)', borderRadius: '18px 18px 18px 4px' }}
                  >
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--text-secondary)' }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-4 py-3 border-t shrink-0"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div
              className="flex items-end gap-3 px-4 py-2.5 rounded-2xl border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className="flex-1 bg-transparent text-sm outline-none resize-none"
                style={{ color: 'var(--text-primary)', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isConnected}
                className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 shrink-0"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Send size={15} strokeWidth={2} />
              </button>
            </div>
            <p className="text-[9px] mt-1.5 text-center" style={{ color: 'var(--text-secondary)' }}>
              Shift+Enter for new line
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
          <MessageSquare size={40} strokeWidth={1} className="mb-4 opacity-30" />
          <p className="text-sm">Select a conversation to start messaging</p>
        </div>
      )}

      {/* New conversation modal */}
      <AnimatePresence>
        {showNewConv && (
          <NewConvModal
            onClose={() => setShowNewConv(false)}
            onCreated={(conv) => {
              setConversations(prev => [conv, ...prev.filter(c => c._id !== conv._id)]);
              setActiveConvId(conv._id);
            }}
            currentUserId={currentUserId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
