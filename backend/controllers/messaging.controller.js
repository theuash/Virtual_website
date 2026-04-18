import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

// ── GET /api/messaging/conversations ─────────────────────────────
// All conversations the current user is a member of, newest first,
// each with its last message attached.
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  const conversations = await Conversation.find({ members: req.user._id })
    .sort({ updatedAt: -1 })
    .lean();

  const withLastMessage = await Promise.all(
    conversations.map(async (conv) => {
      const last = await Message.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .lean();
      const unread = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: req.user._id },
        isRead: false,
      });
      return { ...conv, lastMessage: last ?? null, unreadCount: unread };
    })
  );

  res.json(new ApiResponse(200, withLastMessage, 'Conversations fetched'));
});

// ── GET /api/messaging/conversations/:id/messages ─────────────────
// Paginated message history. Query params: before (ISO date), limit (max 100).
export const getMessages = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const limit  = Math.min(parseInt(req.query.limit) || 50, 100);
  const before = req.query.before ? new Date(req.query.before) : new Date();

  const conv = await Conversation.findById(conversationId).lean();
  if (!conv) return res.status(404).json(new ApiResponse(404, null, 'Conversation not found'));

  const isMember = conv.members.map(String).includes(req.user._id.toString());
  if (!isMember) return res.status(403).json(new ApiResponse(403, null, 'Not a member'));

  const messages = await Message.find({
    conversationId,
    createdAt: { $lt: before },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Mark messages from others as read
  await Message.updateMany(
    { conversationId, senderId: { $ne: req.user._id }, isRead: false },
    { $set: { isRead: true } }
  );

  res.json(new ApiResponse(200, messages.reverse(), 'Messages fetched'));
});

// ── POST /api/messaging/conversations ────────────────────────────
// Create a DM or project conversation.
// Body: { type, members: [userId, ...], projectId?, name? }
export const createConversation = asyncHandler(async (req, res) => {
  const { type = 'dm', members = [], projectId, name } = req.body;
  const allMembers = [...new Set([req.user._id.toString(), ...members])];

  // Reuse existing DM between the same two people
  if (type === 'dm' && allMembers.length === 2) {
    const existing = await Conversation.findOne({
      type: 'dm',
      members: { $all: allMembers, $size: 2 },
    });
    if (existing) return res.json(new ApiResponse(200, existing, 'Existing conversation'));
  }

  const conv = await Conversation.create({
    type,
    members: allMembers,
    ...(projectId && { projectId }),
    ...(name && { name }),
  });

  res.status(201).json(new ApiResponse(201, conv, 'Conversation created'));
});
