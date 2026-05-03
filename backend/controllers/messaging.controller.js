import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { Freelancer } from '../models/Freelancer.js';
import { MomentumSupervisor } from '../models/MomentumSupervisor.js';
import { Team } from '../models/Team.js';
import { findUserById, findUserByVId } from '../utils/findUser.js';
import { Notification } from '../models/Notification.js';

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

// ── DELETE /api/messaging/conversations/:id ───────────────────────
export const deleteConversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!conv) return res.status(404).json(new ApiResponse(404, null, 'Conversation not found'));

  const isMember = conv.members.map(String).includes(req.user._id.toString());
  if (!isMember) return res.status(403).json(new ApiResponse(403, null, 'Not a member'));

  // Remove this user from the conversation members
  conv.members = conv.members.filter(m => m.toString() !== req.user._id.toString());

  if (conv.members.length === 0) {
    // No members left — delete everything
    await Message.deleteMany({ conversationId: conv._id });
    await conv.deleteOne();
  } else {
    await conv.save();
  }

  res.json(new ApiResponse(200, null, 'Conversation deleted'));
});

// ── POST /api/messaging/conversations/:id/block ───────────────────
export const blockUser = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.id).lean();
  if (!conv) return res.status(404).json(new ApiResponse(404, null, 'Conversation not found'));

  const isMember = conv.members.map(String).includes(req.user._id.toString());
  if (!isMember) return res.status(403).json(new ApiResponse(403, null, 'Not a member'));

  // Find the other user and add to blockedBy list
  const otherId = conv.members.find(m => m.toString() !== req.user._id.toString());
  if (!otherId) return res.status(400).json(new ApiResponse(400, null, 'No other member to block'));

  // Store block on the conversation itself
  await Conversation.findByIdAndUpdate(conv._id, {
    $addToSet: { blockedBy: req.user._id },
  });

  res.json(new ApiResponse(200, null, 'User blocked'));
});

// ── POST /api/messaging/conversations/:id/unblock ─────────────────
export const unblockUser = asyncHandler(async (req, res) => {
  await Conversation.findByIdAndUpdate(req.params.id, {
    $pull: { blockedBy: req.user._id },
  });
  res.json(new ApiResponse(200, null, 'User unblocked'));
});

// ── GET /api/messaging/default-conversation ───────────────────────
// Returns (or creates) the pre-seeded conversation for the current user:
//   precrate → DM with their assigned Momentum Supervisor (mentorId)
//   crate    → DM with their Project Initiator (via Team)
//   others   → null (they manage their own chats)
export const getDefaultConversation = asyncHandler(async (req, res) => {
  const me = req.user;
  const myId = me._id.toString();
  let partnerId = null;
  let partnerName = null;

  if (me.tier === 'precrate') {
    // Use mentorId if set, else pick the first available supervisor
    if (me.mentorId) {
      partnerId = me.mentorId.toString();
      const sup = await MomentumSupervisor.findById(me.mentorId).select('fullName').lean();
      partnerName = sup?.fullName || 'Momentum Supervisor';
    } else {
      const sup = await MomentumSupervisor.findOne({ isSuspended: { $ne: true } }).select('_id fullName').lean();
      if (sup) { partnerId = sup._id.toString(); partnerName = sup.fullName; }
    }
  } else if (me.tier === 'crate') {
    // Find the team this crate belongs to and get the initiator
    const team = await Team.findOne({ members: me._id })
      .populate('initiatorId', 'fullName _id')
      .lean();
    if (team?.initiatorId) {
      partnerId = team.initiatorId._id.toString();
      partnerName = team.initiatorId.fullName;
    }
  }

  if (!partnerId) {
    return res.json(new ApiResponse(200, null, 'No default conversation partner'));
  }

  // Find or create the DM
  const allMembers = [myId, partnerId];
  let conv = await Conversation.findOne({
    type: 'dm',
    members: { $all: allMembers, $size: 2 },
  }).lean();

  if (!conv) {
    conv = (await Conversation.create({ type: 'dm', members: allMembers })).toObject();
  }

res.json(new ApiResponse(200, { ...conv, name: partnerName }, 'Default conversation ready'));
});

// ── GET /api/messaging/search-user/:vId ───────────────────────────
export const searchUserByVId = asyncHandler(async (req, res) => {
  const { vId } = req.params;
  const user = await findUserByVId(vId);
  
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }

  // Don't find self
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json(new ApiResponse(400, null, 'You cannot search for yourself'));
  }

  res.json(new ApiResponse(200, {
    _id: user._id,
    fullName: user.fullName,
    userId: user.userId,
    avatar: user.avatar,
    role: user.role
  }, 'User found'));
});
// ── POST /api/messaging/conversations/:id/messages ────────────────
export const sendMessage = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const { content } = req.body;

  if (!content) return res.status(400).json(new ApiResponse(400, null, 'Message content required'));

  const conv = await Conversation.findById(conversationId);
  if (!conv) return res.status(404).json(new ApiResponse(404, null, 'Conversation not found'));

  const isMember = conv.members.map(String).includes(req.user._id.toString());
  if (!isMember) return res.status(403).json(new ApiResponse(403, null, 'Not a member'));

  const message = await Message.create({
    conversationId,
    senderId: req.user._id,
    content
  });

  // Update conversation timestamp for sorting
  conv.updatedAt = new Date();
  await conv.save();

  // If this is the first message in a DM, notify the recipient
  const messageCount = await Message.countDocuments({ conversationId });
  if (messageCount === 1 && conv.type === 'dm') {
    const otherId = conv.members.find(m => m.toString() !== req.user._id.toString());
    const other = await findUserById(otherId);
    if (other) {
      const roleToModel = {
        client: 'Client',
        freelancer: 'Freelancer',
        momentum_supervisor: 'MomentumSupervisor',
        project_initiator: 'ProjectInitiator',
        admin: 'Admin'
      };
      await Notification.create({
        recipientId: other._id,
        recipientModel: roleToModel[other.role] || 'Admin',
        title: 'New Message Request',
        message: `${req.user.fullName} is trying to text you.`,
        type: 'message',
        link: `/messages?conv=${conversationId}`
      });
    }
  }

  res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});
