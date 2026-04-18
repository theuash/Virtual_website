/**
 * Virtual — Messaging Server
 * Runs independently on port 4001.
 * Main backend runs on port 5001.
 * JWT secret is shared — same tokens work on both servers.
 */

import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { Message } from './models/Message.js';
import { Conversation } from './models/Conversation.js';

const PORT = process.env.PORT || 4001;

// ── Express app ───────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// ── HTTP + Socket.io server ───────────────────────────────────────
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ── Redis adapter (Upstash or any Redis-compatible) ───────────────
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
console.log('Redis adapter connected');

// ── MongoDB ───────────────────────────────────────────────────────
await mongoose.connect(process.env.MONGODB_URI);
console.log('MongoDB connected');

// ─────────────────────────────────────────────────────────────────
// MIDDLEWARE HELPERS
// ─────────────────────────────────────────────────────────────────

/** Verify JWT and return decoded payload, or throw. */
const verifyToken = (token) => {
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, process.env.JWT_SECRET);
};

/** Express middleware — requires valid JWT in Authorization header. */
const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

/** Express middleware — requires the shared internal secret header. */
const requireInternal = (req, res, next) => {
  const secret = req.headers['x-internal-secret'];
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────
// REST ENDPOINTS
// ─────────────────────────────────────────────────────────────────

/**
 * GET /conversations
 * Returns all conversations the authenticated user is a member of.
 */
app.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ members: userId })
      .sort({ updatedAt: -1 })
      .lean();

    // Attach last message to each conversation
    const withLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const last = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .lean();
        return { ...conv, lastMessage: last ?? null };
      })
    );

    res.json({ success: true, data: withLastMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /conversations/:conversationId/messages?before=<ISO>&limit=<n>
 * Returns paginated message history for a conversation.
 * User must be a member.
 */
app.get('/conversations/:conversationId/messages', requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit  = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before ? new Date(req.query.before) : new Date();

    // Verify membership
    const conv = await Conversation.findById(conversationId).lean();
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conv.members.map(String).includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not a member of this conversation' });
    }

    const messages = await Message.find({
      conversationId,
      createdAt: { $lt: before },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Mark unread messages as read for this user
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user.id }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /conversations
 * Create a new DM or project conversation.
 * Body: { type: 'dm'|'team'|'project', members: [userId, ...], projectId? }
 */
app.post('/conversations', requireAuth, async (req, res) => {
  try {
    const { type = 'dm', members = [], projectId } = req.body;
    const userId = req.user.id;

    // Always include the creator
    const allMembers = [...new Set([userId, ...members])];

    // For DMs, reuse existing conversation between the same two people
    if (type === 'dm' && allMembers.length === 2) {
      const existing = await Conversation.findOne({
        type: 'dm',
        members: { $all: allMembers, $size: 2 },
      });
      if (existing) return res.json({ success: true, data: existing });
    }

    const conv = await Conversation.create({
      type,
      members: allMembers,
      ...(projectId && { projectId }),
    });

    res.status(201).json({ success: true, data: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /internal/conversations
 * Called by the main backend when a project or team is created.
 * Protected by shared INTERNAL_SECRET header.
 * Body: { type, members, projectId? }
 */
app.post('/internal/conversations', requireInternal, async (req, res) => {
  try {
    const { type = 'project', members = [], projectId } = req.body;

    if (!members.length) {
      return res.status(400).json({ success: false, message: 'members array is required' });
    }

    // Avoid duplicate project conversations
    if (projectId) {
      const existing = await Conversation.findOne({ projectId });
      if (existing) return res.json({ success: true, data: existing, created: false });
    }

    const conv = await Conversation.create({
      type,
      members,
      ...(projectId && { projectId }),
    });

    res.status(201).json({ success: true, data: conv, created: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /internal/conversations/:conversationId
 * Fetch a conversation by ID — for main backend use.
 */
app.get('/internal/conversations/:conversationId', requireInternal, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.conversationId).lean();
    if (!conv) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// SOCKET.IO — AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────────

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token
      || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    socket.user = verifyToken(token);
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});

// ─────────────────────────────────────────────────────────────────
// SOCKET.IO — CONNECTION HANDLER
// ─────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  const userId = socket.user.id;
  console.log(`[socket] connected: ${userId} (${socket.id})`);

  // ── join_conversation ─────────────────────────────────────────
  // Client emits this to subscribe to a conversation room.
  // Validates membership before joining.
  socket.on('join_conversation', async ({ conversationId }, ack) => {
    try {
      const conv = await Conversation.findById(conversationId).lean();
      if (!conv) return ack?.({ error: 'Conversation not found' });
      if (!conv.members.map(String).includes(userId)) {
        return ack?.({ error: 'Not a member of this conversation' });
      }

      socket.join(conversationId);
      console.log(`[socket] ${userId} joined room ${conversationId}`);
      ack?.({ ok: true });
    } catch (err) {
      ack?.({ error: err.message });
    }
  });

  // ── send_message ──────────────────────────────────────────────
  // Client emits this to send a message to a conversation.
  // Persists to MongoDB, then broadcasts to the room.
  socket.on('send_message', async ({ conversationId, content }, ack) => {
    try {
      if (!conversationId || !content?.trim()) {
        return ack?.({ error: 'conversationId and content are required' });
      }

      // Verify membership
      const conv = await Conversation.findById(conversationId).lean();
      if (!conv) return ack?.({ error: 'Conversation not found' });
      if (!conv.members.map(String).includes(userId)) {
        return ack?.({ error: 'Not a member of this conversation' });
      }

      // Persist message
      const message = await Message.create({
        conversationId,
        senderId: userId,
        content:  content.trim(),
        isRead:   false,
      });

      // Update conversation's updatedAt so it sorts to top
      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

      const payload = message.toObject();

      // Broadcast to everyone in the room (including sender for confirmation)
      io.to(conversationId).emit('new_message', payload);

      ack?.({ ok: true, message: payload });
    } catch (err) {
      ack?.({ error: err.message });
    }
  });

  // ── typing ────────────────────────────────────────────────────
  // Lightweight typing indicator — not persisted.
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user_typing', { userId, isTyping });
  });

  // ── leave_conversation ────────────────────────────────────────
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(conversationId);
    console.log(`[socket] ${userId} left room ${conversationId}`);
  });

  // ── disconnect ────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[socket] disconnected: ${userId} — ${reason}`);
  });
});

// ─────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`Messaging server running on port ${PORT}`);
});
