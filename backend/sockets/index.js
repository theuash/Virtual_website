import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { findUserById } from '../utils/findUser.js';
import { registerChatHandlers } from './chat.socket.js';

/**
 * Attaches Socket.io to the existing HTTP server.
 * Call this once from server.js after the HTTP server is created.
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server} io
 */
export function initSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL,
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware ─────────────────────────────────────────────
  // Runs before every connection. Rejects unauthenticated sockets.
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) throw new Error('No token');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await findUserById(decoded.id);

      if (!user)            throw new Error('User not found');
      if (user.isSuspended) throw new Error('Account suspended');

      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  // ── Connection handler ──────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.user._id} (${socket.id})`);
    registerChatHandlers(io, socket);
  });

  return io;
}
