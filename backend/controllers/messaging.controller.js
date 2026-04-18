import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { findUserById } from '../utils/findUser.js';

// ── Helper: resolve display name for a conversation ───────────────
// For DMs: show the OTHER person's name.
// For project/group: show conv.name or fallback.
const resolveConvName = async (conv, currentUserId) => {
  if (conv.name) return conv.name;

  if (conv.type === 'dm') {
    const otherId = conv.members.find(m => m.toString() !== currentUserId.toString());
    if (otherId) {
      const other = await findUserById(otherId);
      if (other?.fullName) return other.fullName;
    }
    return 'Direct Message';
  }

  return conv.projectId ? `Project Chat` : 'Group Chat';
};

// ── GET /api/messaging/conversations ─────────────────────────────
export const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const conversations = await Conversation.find({ members: currentUserId })
    .sort({ updatedAt: -1 })
    .lean();

  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const [last, unread, resolvedName] = await Promise.all([
        Message.findOne({ conversationId: conv._id }).sort({ createdAt: -1 }).lean(),
        Message.countDocuments({ conversationId: conv._id, senderId: { $ne: currentUserId }, isRead: false }),
        resolveConvName(conv, currentUserId),
      ]);
      return { ...conv, name: resolvedName, lastMessage: last ?? null, unreadCount: unread };
    })
  );

  res.json(new ApiResponse(200, enriched, 'Conversations fetched'));
});

// ── GET /api/messaging/conversations/:id/messages ─────────────────
export const getMessages = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const limit  = Math.min(parseInt(req.query.limit) || 50, 100);
  const before = req.query.before ? new Date(req.query.before) : new Date();

  const conv = await Conversation.findById(conversationId).lean();
  if (!conv) return res.status(404).json(new ApiResponse(404, null, 'Conversation not found'));

  const isMember = conv.members.map(String).includes(req.user._id.toString());
  if (!isMember) return res.status(403).json(new ApiResponse(403, null, 'Not a member'));

  const messages = await Message.find({ conversationId, createdAt: { $lt: before } })
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
export const createConversation = asyncHandler(async (req, res) => {
  const { type = 'dm', members = [], projectId, name } = req.body;
  const allMembers = [...new Set([req.user._id.toString(), ...members])];

  // Reuse existing DM between the same two people
  if (type === 'dm' && allMembers.length === 2) {
    const existing = await Conversation.findOne({
      type: 'dm',
      members: { $all: allMembers, $size: 2 },
    });
    if (existing) {
      const resolvedName = await resolveConvName(existing.toObject(), req.user._id);
      return res.json(new ApiResponse(200, { ...existing.toObject(), name: resolvedName }, 'Existing conversation'));
    }
  }

  const conv = await Conversation.create({
    type,
    members: allMembers,
    ...(projectId && { projectId }),
    // Only store explicit name for group/project chats — DMs resolve dynamically
    ...(name && type !== 'dm' && { name }),
  });

  const resolvedName = await resolveConvName(conv.toObject(), req.user._id);
  res.status(201).json(new ApiResponse(201, { ...conv.toObject(), name: resolvedName }, 'Conversation created'));
});
