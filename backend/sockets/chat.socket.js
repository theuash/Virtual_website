import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

/**
 * Registers all chat-related Socket.io events on a connected socket.
 * Called once per connection from sockets/index.js.
 */
export function registerChatHandlers(io, socket) {
  const userId = socket.user._id.toString();

  // ── join_conversation ─────────────────────────────────────────
  // Client joins a room to receive messages for that conversation.
  socket.on('join_conversation', async ({ conversationId }, ack) => {
    try {
      const conv = await Conversation.findById(conversationId).lean();
      if (!conv) return ack?.({ error: 'Conversation not found' });

      const isMember = conv.members.map(String).includes(userId);
      if (!isMember) return ack?.({ error: 'Not a member of this conversation' });

      socket.join(conversationId);
      ack?.({ ok: true });
    } catch (err) {
      ack?.({ error: err.message });
    }
  });

  // ── send_message ──────────────────────────────────────────────
  // Persists the message and broadcasts it to everyone in the room.
  socket.on('send_message', async ({ conversationId, content }, ack) => {
    try {
      if (!conversationId || !content?.trim()) {
        return ack?.({ error: 'conversationId and content are required' });
      }

      const conv = await Conversation.findById(conversationId).lean();
      if (!conv) return ack?.({ error: 'Conversation not found' });

      const isMember = conv.members.map(String).includes(userId);
      if (!isMember) return ack?.({ error: 'Not a member of this conversation' });

      const message = await Message.create({
        conversationId,
        senderId: socket.user._id,
        content:  content.trim(),
        isRead:   false,
      });

      // Bump conversation to top of list
      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

      const payload = message.toObject();

      // Broadcast to all sockets in the room (including sender)
      io.to(conversationId).emit('new_message', payload);

      ack?.({ ok: true, message: payload });
    } catch (err) {
      ack?.({ error: err.message });
    }
  });

  // ── typing ────────────────────────────────────────────────────
  // Lightweight — not persisted.
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user_typing', {
      userId,
      isTyping: Boolean(isTyping),
    });
  });

  // ── leave_conversation ────────────────────────────────────────
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(conversationId);
  });

  // ── disconnect ────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[socket] disconnected: ${userId} — ${reason}`);
  });
}
