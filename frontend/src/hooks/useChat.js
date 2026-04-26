import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const MESSAGING_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

/**
 * useChat - connects to the messaging server, joins a conversation room,
 * and exposes messages state + sendMessage function.
 *
 * @param {string|null} conversationId  - the conversation to join (null = not connected)
 * @param {string|null} token           - JWT access token from AuthContext
 *
 * @returns {{
 *   messages:     object[],
 *   sendMessage:  (content: string) => void,
 *   isConnected:  boolean,
 *   isTyping:     boolean,        - true if the other party is typing
 *   sendTyping:   (bool) => void, - call with true/false to broadcast typing state
 *   error:        string|null,
 * }}
 */
export function useChat(conversationId, token) {
  const socketRef = useRef(null);

  const [messages,    setMessages]    = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping,    setIsTyping]    = useState(false);
  const [error,       setError]       = useState(null);

  //  Connect / disconnect when token changes 
  useEffect(() => {
    if (!token) return;

    const socket = io(MESSAGING_URL, {
      auth:       { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError(err.message || 'Connection failed');
      setIsConnected(false);
    });

    // Incoming message from the server
    socket.on('new_message', (message) => {
      setMessages((prev) => {
        // Deduplicate by _id in case of re-delivery
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    // Typing indicator from the other party
    socket.on('user_typing', ({ isTyping: typing }) => {
      setIsTyping(typing);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  //  Join / leave conversation room when conversationId changes 
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    setMessages([]); // clear messages when switching conversations

    socket.emit('join_conversation', { conversationId }, (ack) => {
      if (ack?.error) setError(ack.error);
    });

    return () => {
      socket.emit('leave_conversation', { conversationId });
    };
  }, [conversationId]);

  //  Load message history via REST on conversation change 
  useEffect(() => {
    if (!conversationId || !token) return;

    fetch(`${MESSAGING_URL}/api/messaging/conversations/${conversationId}/messages?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setMessages(res.data);
      })
      .catch(() => {}); // silent - socket will deliver new messages anyway
  }, [conversationId, token]);

  //  sendMessage 
  const sendMessage = useCallback(
    (content) => {
      const socket = socketRef.current;
      if (!socket || !conversationId || !content?.trim()) return;

      socket.emit('send_message', { conversationId, content: content.trim() }, (ack) => {
        if (ack?.error) setError(ack.error);
      });
    },
    [conversationId]
  );

  //  sendTyping 
  const sendTyping = useCallback(
    (typing) => {
      const socket = socketRef.current;
      if (!socket || !conversationId) return;
      socket.emit('typing', { conversationId, isTyping: typing });
    },
    [conversationId]
  );

  return { messages, sendMessage, isConnected, isTyping, sendTyping, error };
}
