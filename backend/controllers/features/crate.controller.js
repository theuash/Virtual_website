import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { Project } from '../../models/projects/Project.js';
import { MicroTask } from '../../models/projects/MicroTask.js';
import { Freelancer } from '../../models/users/Freelancer.js';
import { Team } from '../../models/projects/Team.js';
import { FreelancerWallet } from '../../models/finance/FreelancerWallet.js';
import { Conversation } from '../../models/communication/Conversation.js';

// ── GET /crate/projects ──────────────────────────────────────────
// Projects assigned to this crate member (via MicroTask.assignedTo)
export const getCrateProjects = asyncHandler(async (req, res) => {
  const tasks = await MicroTask.find({ assignedTo: req.user._id })
    .populate('projectId', 'title description category status deadline totalAmount clientId assignedInitiatorId')
    .lean();

  // Group tasks by project
  const projectMap = {};
  for (const task of tasks) {
    const pid = task.projectId?._id?.toString();
    if (!pid) continue;
    if (!projectMap[pid]) {
      projectMap[pid] = { ...task.projectId, tasks: [] };
    }
    projectMap[pid].tasks.push(task);
  }

  const projects = Object.values(projectMap);
  res.json(new ApiResponse(200, projects, 'Projects fetched'));
});

// ── GET /crate/projects/:id ──────────────────────────────────────
export const getCrateProjectDetail = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('assignedInitiatorId', 'fullName email primarySkill tier')
    .lean();
  if (!project) throw new ApiError(404, 'Project not found');

  const tasks = await MicroTask.find({
    projectId: req.params.id,
    assignedTo: req.user._id,
  }).lean();

  const team = await Team.findOne({ projectId: req.params.id })
    .populate('members', 'fullName primarySkill tier rating')
    .populate('initiatorId', 'fullName email primarySkill tier')
    .lean();

  res.json(new ApiResponse(200, { project, tasks, team }, 'Project detail fetched'));
});

// ── GET /crate/team ──────────────────────────────────────────────
// Returns the team(s) this crate member belongs to + their Project Initiator
export const getMyTeam = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id })
    .populate('projectId', 'title status deadline category')
    .populate('initiatorId', 'fullName email primarySkill tier avatar')
    .populate('members', 'fullName primarySkill tier rating avatar')
    .lean();

  res.json(new ApiResponse(200, teams, 'Team fetched'));
});

// ── GET /crate/freelancers ───────────────────────────────────────
// Browse other crate-level freelancers (for saving/messaging)
export const getCrateFreelancers = asyncHandler(async (req, res) => {
  const { skill, search } = req.query;
  const filter = {
    tier: 'crate',
    _id: { $ne: req.user._id },
    isSuspended: { $ne: true },
  };
  if (skill) filter.primarySkill = skill;
  if (search) filter.fullName = { $regex: search, $options: 'i' };

  const freelancers = await Freelancer.find(filter)
    .select('fullName primarySkill secondarySkills tier rating tasksCompleted avatar')
    .limit(50)
    .lean();

  res.json(new ApiResponse(200, freelancers, 'Freelancers fetched'));
});

// ── POST /crate/freelancers/:id/message ─────────────────────────
// Start or get a DM conversation with another freelancer
export const messageFreelancer = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const myId = req.user._id;

  // Check if conversation already exists
  let conv = await Conversation.findOne({
    type: 'dm',
    members: { $all: [myId, targetId], $size: 2 },
  });

  if (!conv) {
    conv = await Conversation.create({
      type: 'dm',
      members: [myId, targetId],
      name: '',
    });
  }

  res.json(new ApiResponse(200, { conversationId: conv._id }, 'Conversation ready'));
});

// ── GET /crate/wallet ────────────────────────────────────────────
export const getCrateWallet = asyncHandler(async (req, res) => {
  let wallet = await FreelancerWallet.findOne({ freelancerId: req.user._id });
  if (!wallet) {
    wallet = await FreelancerWallet.create({ freelancerId: req.user._id });
  }
  res.json(new ApiResponse(200, wallet, 'Wallet fetched'));
});

// ── POST /crate/wallet/withdraw ──────────────────────────────────
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, method, accountDetails } = req.body;
  if (!amount || amount < 100) throw new ApiError(400, 'Minimum withdrawal is ₹100');

  let wallet = await FreelancerWallet.findOne({ freelancerId: req.user._id });
  if (!wallet) throw new ApiError(404, 'Wallet not found');
  if (wallet.balance < amount) throw new ApiError(400, 'Insufficient balance');

  wallet.balance -= amount;
  wallet.totalWithdrawn += amount;
  wallet.transactions.push({
    type: 'withdrawal',
    amount,
    description: `Withdrawal via ${method || 'bank transfer'}`,
    status: 'pending',
    reference: `WD-${Date.now()}`,
  });
  await wallet.save();

  res.json(new ApiResponse(200, {
    balance: wallet.balance,
    message: 'Withdrawal request submitted. Funds will be transferred within 2-3 business days.',
  }, 'Withdrawal requested'));
});

// ── GET /crate/announcements ─────────────────────────────────────
// Project Initiator messages/announcements for this crate member's projects
export const getAnnouncements = asyncHandler(async (req, res) => {
  // Get all project IDs this user is assigned to
  const tasks = await MicroTask.find({ assignedTo: req.user._id }).distinct('projectId');

  // Get project conversations of type 'project' for those projects
  const convs = await Conversation.find({
    type: 'project',
    projectId: { $in: tasks },
    members: req.user._id,
  })
    .populate('projectId', 'title status')
    .lean();

  res.json(new ApiResponse(200, convs, 'Announcements fetched'));
});
