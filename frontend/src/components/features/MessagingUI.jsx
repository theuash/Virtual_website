import { useState, useEffect, useRef } from 'react';
import { 
  Search, MoreVertical, Paperclip, Send, 
  ChevronLeft, Smile, Phone, Video, 
  Check, CheckCheck, Menu, User, 
  ArrowLeft, X, Trash2, Ban, Mic, Plus 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Messaging.css';

const REFRESH_INTERVAL = 3000; // 3 seconds

export default function MessagingUI({ initialConvId = null }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchVId, setSearchVId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch conversations
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/messaging/conversations');
      const convs = res.data?.data || [];
      setConversations(convs);
      
      // If we have an initial ID, select it
      if (initialConvId && !selectedConv) {
        const found = convs.find(c => c._id === initialConvId);
        if (found) {
          handleSelectConversation(found);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (convId, silent = false) => {
    if (!convId) return;
    try {
      if (!silent) setMessagesLoading(true);
      const res = await api.get(`/messaging/conversations/${convId}/messages`);
      setMessages(res.data?.data || []);
      if (!silent) scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Set up polling
    pollingRef.current = setInterval(() => {
      fetchConversations(true);
      if (selectedConv) {
        fetchMessages(selectedConv._id, true);
      }
    }, REFRESH_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedConv]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectConversation = (conv) => {
    setSelectedConv(conv);
    setIsMobileChatOpen(true);
    fetchMessages(conv._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      // Optimistic update
      const tempMsg = {
        _id: Date.now().toString(),
        senderId: user._id,
        content,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };
      setMessages(prev => [...prev, tempMsg]);
      scrollToBottom();

      await api.post(`/messaging/conversations/${selectedConv._id}/messages`, { content });
      fetchMessages(selectedConv._id, true);
      fetchConversations(true);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearchUser = async () => {
    if (!searchVId.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await api.get(`/messaging/search-user/${searchVId.trim()}`);
      setSearchResult(res.data?.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'User not found');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStartConversation = async (otherUser) => {
    try {
      const res = await api.post('/messaging/conversations', {
        type: 'dm',
        members: [otherUser._id]
      });
      const newConv = res.data?.data;
      setConversations(prev => {
        const exists = prev.find(c => c._id === newConv._id);
        if (exists) return prev;
        return [newConv, ...prev];
      });
      handleSelectConversation(newConv);
      setIsSearchModalOpen(false);
      setSearchVId('');
      setSearchResult(null);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusTicks = (msg) => {
    if (msg.isRead) return <CheckCheck size={14} className="text-[#53bdeb]" />;
    return <Check size={14} className="text-gray-400" />;
  };

  return (
    <div className={`wa-container ${isMobileChatOpen ? 'chat-open' : ''}`}>
      {/* Sidebar - Desktop List & Mobile List */}
      <div className="wa-sidebar">
        <div className="wa-sidebar-header">
          <div className="flex items-center gap-3">
            <div className="wa-avatar">
              <div className="w-full h-full bg-[#dfe5e7] flex items-center justify-center text-gray-500">
                <User size={24} />
              </div>
            </div>
            <span className="md:hidden font-bold text-lg">Messages</span>
          </div>
          <div className="wa-header-actions">
            <Plus size={20} className="cursor-pointer" onClick={() => setIsSearchModalOpen(true)} />
            <MoreVertical size={20} />
          </div>
        </div>

        <div className="wa-search-container">
          <div className="wa-search-wrapper">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="wa-chat-list">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading chats...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No chats found</div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv._id} 
                className={`wa-chat-item ${selectedConv?._id === conv._id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="wa-avatar">
                  <div className="w-full h-full bg-[#dfe5e7] flex items-center justify-center text-gray-500 font-bold">
                    {conv.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="wa-chat-info">
                  <div className="wa-chat-top">
                    <span className="wa-chat-name">{conv.name}</span>
                    {conv.lastMessage && (
                      <span className="wa-chat-time">{formatTime(conv.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <div className="wa-chat-bottom">
                    <span className="wa-chat-preview">
                      {conv.lastMessage?.content || 'Click to start chatting'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="wa-unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="wa-main">
        {selectedConv ? (
          <>
            <div className="wa-chat-header">
              <div className="wa-chat-header-info" onClick={() => setIsMobileChatOpen(false)}>
                <div className="md:hidden flex items-center mr-3">
                  <ChevronLeft size={24} className="text-gray-600" />
                </div>
                <div className="wa-avatar wa-avatar-small">
                  <div className="w-full h-full bg-[#dfe5e7] flex items-center justify-center text-gray-500 font-bold text-sm">
                    {selectedConv.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="wa-chat-name" style={{ fontSize: '16px', lineHeight: '1.2' }}>{selectedConv.name}</div>
                  <div className="text-[12px] text-gray-500">online</div>
                </div>
              </div>
              <div className="wa-header-actions">
                <Video size={20} className="hidden sm:block" />
                <Phone size={20} className="hidden sm:block" />
                <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden sm:block"></div>
                <Search size={20} />
                <MoreVertical size={20} />
              </div>
            </div>

            <div className="wa-messages-area">
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">Loading messages...</div>
              ) : (
                messages.map((msg, i) => {
                  const isOutgoing = msg.senderId === user._id;
                  return (
                    <div key={msg._id} className={`wa-msg-wrapper ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                      <div className={`wa-message ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                        {msg.content}
                        <div className="flex items-center justify-end">
                          <span className="wa-msg-time">{formatTime(msg.createdAt)}</span>
                          {isOutgoing && <span className="ml-1">{getStatusTicks(msg)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="wa-chat-input-area" onSubmit={handleSendMessage}>
              <Smile size={22} className="text-gray-500 cursor-pointer hidden xs:block" />
              <Paperclip size={22} className="text-gray-500 cursor-pointer" />
              <div className="wa-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Type a message" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
              {newMessage.trim() ? (
                <button type="submit" className="bg-transparent border-none p-2 cursor-pointer flex items-center justify-center">
                  <Send size={24} className="text-[#00a884]" />
                </button>
              ) : (
                <button type="button" className="bg-transparent border-none p-2 cursor-pointer flex items-center justify-center">
                  <Mic size={24} className="text-gray-500" />
                </button>
              )}
            </form>
          </>
        ) : (
          <div className="wa-empty-state">
            <div className="w-64 h-64 opacity-20 mb-8">
              <svg viewBox="0 0 250 250" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M125 0C55.964 0 0 55.964 0 125s55.964 125 125 125 125-55.964 125-125S194.036 0 125 0zm0 225C69.75 225 25 180.25 25 125S69.75 25 125 25s100 44.75 100 100-44.75 100-100 100z"/>
                <path d="M175 125h-50V75c0-13.81-11.19-25-25-25s-25 11.19-25 25v75c0 13.81 11.19 25 25 25h75c13.81 0 25-11.19 25-25s-11.19-25-25-25z"/>
              </svg>
            </div>
            <h1>Virtual Messages</h1>
            <p>
              Send and receive messages in real-time.<br/>
              Your conversations are synced across all your devices.
            </p>
            <div className="wa-empty-border"></div>
          </div>
        )}
      </div>

      {/* New Contact Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#202c33] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">New Chat</h2>
              <button onClick={() => { setIsSearchModalOpen(false); setSearchResult(null); setSearchError(''); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Enter the Virtual ID (V-ID) of the person you want to message.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="e.g. V-2026CAT1234" 
                    className="w-full bg-gray-100 dark:bg-[#111b21] border-none rounded-xl py-3 px-4 dark:text-white focus:ring-2 focus:ring-[#00a884] outline-none"
                    value={searchVId}
                    onChange={(e) => setSearchVId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  />
                </div>
                <button 
                  onClick={handleSearchUser}
                  disabled={searchLoading}
                  className="bg-[#00a884] hover:bg-[#008f72] text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {searchLoading ? '...' : 'Search'}
                </button>
              </div>

              {searchError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm text-center">
                  {searchError}
                </div>
              )}

              {searchResult && (
                <div className="mt-6 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="wa-avatar" style={{ margin: 0 }}>
                      <div className="w-full h-full bg-[#dfe5e7] flex items-center justify-center text-gray-500 font-bold">
                        {searchResult.fullName?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold dark:text-white">{searchResult.fullName}</div>
                      <div className="text-xs text-gray-500">{searchResult.userId}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartConversation(searchResult)}
                    className="bg-[#00a884] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#008f72]"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
