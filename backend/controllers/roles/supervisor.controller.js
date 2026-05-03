import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { Project } from '../../models/projects/Project.js';
import { MicroTask } from '../../models/projects/MicroTask.js';
import { Freelancer } from '../../models/users/Freelancer.js';
import { Team } from '../../models/projects/Team.js';
import { LearningProgress } from '../../models/learning/LearningProgress.js';
import { Payroll } from '../../models/finance/Payroll.js';
import { SupervisorWallet } from '../../models/finance/SupervisorWallet.js';
import { Conversation } from '../../models/communication/Conversation.js';
import { FreelancerWallet } from '../../models/finance/FreelancerWallet.js';
import { Client } from '../../models/users/Client.js';
import { Notification } from '../../models/communication/Notification.js';

const myId = (req) => req.user._id;

// ── Helper: Generate Client ID ──────────────────────────────────
// Format: V-[TYPE]-[CC][YY][RANDOM] (e.g. V-CG-IN26FGINM6)
const generateClientId = async (client) => {
  const type = client.clientType || 'CG';
  const countryCode = (client.country?.substring(0, 2) || 'XX').toUpperCase();
  const year = new Date().getFullYear().toString().substring(2);
  
  const generateRandom = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let res = '';
    for (let i = 0; i < 5; i++) res += letters.charAt(Math.floor(Math.random() * letters.length));
    res += numbers.charAt(Math.floor(Math.random() * numbers.length));
    return res;
  };

  let finalId = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const random = generateRandom();
    finalId = `V-${type}-${countryCode}${year}${random}`;
    const existing = await Client.findOne({ clientId: finalId });
    if (!existing) isUnique = true;
    attempts++;
  }

  return finalId;
};

// ── GET /supervisor/projects ─────────────────────────────────────
export const getSupervisorProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate('clientId', 'fullName email company avatar')
    .populate('assignedInitiatorId', 'fullName tier primarySkill')
    .sort({ timeSensitive: -1, createdAt: -1 })
    .lean();

  // Attach task summary
  const enriched = await Promise.all(projects.map(async (p) => {
    const tasks = await MicroTask.find({ projectId: p._id }).lean();
    const approved  = tasks.filter(t => t.status === 'approved').length;
    const submitted = tasks.filter(t => t.status === 'submitted').length;
    return { ...p, taskSummary: { total: tasks.length, approved, submitted } };
  }));

  res.json(new ApiResponse(200, enriched, 'Projects fetched'));
});

// ── GET /supervisor/projects/:id ─────────────────────────────────
export const getSupervisorProjectDetail = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('clientId', 'fullName email company avatar')
    .populate('assignedInitiatorId', 'fullName tier primarySkill rating')
    .lean();
  if (!project) throw new ApiError(404, 'Project not found');

  const tasks = await MicroTask.find({ projectId: req.params.id })
    .populate('assignedTo', 'fullName tier primarySkill')
    .lean();

  const team = await Team.findOne({ projectId: req.params.id })
    .populate('members', 'fullName tier primarySkill rating tasksCompleted')
    .populate('initiatorId', 'fullName tier primarySkill rating')
    .lean();

  const payroll = await Payroll.findOne({ projectId: req.params.id }).lean();

  res.json(new ApiResponse(200, { project, tasks, team, payroll }, 'Project detail fetched'));
});

// ── POST /supervisor/projects/:id/dispatch ───────────────────────
// Assign project to a team (set assignedInitiatorId + create/update Team)
export const dispatchProject = asyncHandler(async (req, res) => {
  const { initiatorId, memberIds = [], payrollEntries = [] } = req.body;
  const projectId = req.params.id;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  // Assign initiator
  project.assignedInitiatorId = initiatorId;
  project.status = 'in_progress';
  await project.save();

  // Create or update team
  await Team.findOneAndUpdate(
    { projectId },
    { projectId, initiatorId, members: memberIds },
    { upsert: true, new: true }
  );

  // Create payroll if entries provided
  if (payrollEntries.length > 0) {
    await Payroll.findOneAndUpdate(
      { projectId },
      {
        projectId,
        supervisorId: myId(req),
        totalBudget: project.totalAmount || project.openBudget || 0,
        entries: payrollEntries,
        finalized: false,
      },
      { upsert: true, new: true }
    );
  }

  res.json(new ApiResponse(200, { dispatched: true }, 'Project dispatched'));
});

// ── GET /supervisor/teams ────────────────────────────────────────
export const getSupervisorTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find()
    .populate('projectId', 'title status deadline category timeSensitive totalAmount')
    .populate('initiatorId', 'fullName tier primarySkill rating tasksCompleted')
    .populate('members', 'fullName tier primarySkill rating tasksCompleted')
    .lean();

  // Attach task workload per team
  const enriched = await Promise.all(teams.map(async (t) => {
    const tasks = await MicroTask.find({ projectId: t.projectId?._id }).lean();
    const activeTasks = tasks.filter(t => ['assigned', 'submitted'].includes(t.status)).length;
    return { ...t, activeTasks, totalTasks: tasks.length };
  }));

  res.json(new ApiResponse(200, enriched, 'Teams fetched'));
});

// ── GET /supervisor/precrates ────────────────────────────────────
export const getPrecrates = asyncHandler(async (req, res) => {
  // Only return precrates assigned to THIS supervisor
  const precrates = await Freelancer.find({
    tier: 'precrate',
    isSuspended: { $ne: true },
    mentorId: myId(req),
  })
    .select('fullName email primarySkill secondarySkills hoursPerWeek preferredContactTime createdAt mentorId')
    .lean();

  // Attach learning progress summary
  const enriched = await Promise.all(precrates.map(async (f) => {
    const progress = await LearningProgress.find({ freelancerId: f._id }).lean();
    const completed = progress.filter(p => p.completed).length;
    return { ...f, learningProgress: { completed, total: progress.length } };
  }));

  res.json(new ApiResponse(200, enriched, 'Precrates fetched'));
});

// ── GET /supervisor/precrates/:id ───────────────────────────────
export const getPrecratDetail = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findOne({ _id: req.params.id, mentorId: myId(req) })
    .select('-passwordHash -otpCodeHash -otpExpiresAt -otpSentAt -otpContext -loginOtpPending')
    .lean();
  if (!freelancer) throw new ApiError(404, 'Freelancer not found or not under your supervision');

  const progress = await LearningProgress.find({ freelancerId: freelancer._id }).lean();
  const completed = progress.filter(p => p.completed).length;

  res.json(new ApiResponse(200, {
    ...freelancer,
    learningProgress: { completed, total: progress.length, records: progress },
  }, 'Precrate detail fetched'));
});

// ── PATCH /supervisor/precrates/:id ─────────────────────────────
export const updatePrecrate = asyncHandler(async (req, res) => {
  const { primarySkill, secondarySkills, hoursPerWeek, preferredContactTime } = req.body;

  const freelancer = await Freelancer.findOne({ _id: req.params.id, mentorId: myId(req) });
  if (!freelancer) throw new ApiError(404, 'Freelancer not found or not under your supervision');

  const allowed = {};
  if (primarySkill)          allowed.primarySkill = primarySkill;
  if (secondarySkills)       allowed.secondarySkills = secondarySkills;
  if (hoursPerWeek)          allowed.hoursPerWeek = Number(hoursPerWeek);
  if (preferredContactTime)  allowed.preferredContactTime = preferredContactTime;

  const updated = await Freelancer.findByIdAndUpdate(req.params.id, { $set: allowed }, { new: true })
    .select('-passwordHash -otpCodeHash -otpExpiresAt -otpSentAt');

  res.json(new ApiResponse(200, updated, 'Freelancer updated'));
});

// ── POST /supervisor/precrates/:id/suspend ───────────────────────
export const suspendPrecrate = asyncHandler(async (req, res) => {
  const { suspend = true, reason = '' } = req.body;

  const freelancer = await Freelancer.findOne({ _id: req.params.id, mentorId: myId(req) });
  if (!freelancer) throw new ApiError(404, 'Freelancer not found or not under your supervision');

  freelancer.isSuspended = suspend;
  await freelancer.save();

  res.json(new ApiResponse(200, { isSuspended: freelancer.isSuspended }, suspend ? 'Freelancer suspended' : 'Freelancer reinstated'));
});

// ── GET /supervisor/group-projects ──────────────────────────────
export const getGroupProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ projectType: 'group' })
    .populate('clientId', 'fullName email company')
    .populate('assignedInitiatorId', 'fullName tier')
    .populate('coInitiators', 'fullName tier primarySkill')
    .lean();

  const enriched = await Promise.all(projects.map(async (p) => {
    const tasks = await MicroTask.find({ projectId: p._id }).lean();
    return { ...p, taskSummary: { total: tasks.length, approved: tasks.filter(t => t.status === 'approved').length } };
  }));

  res.json(new ApiResponse(200, enriched, 'Group projects fetched'));
});

// ── GET /supervisor/clients ──────────────────────────────────────
export const getSupervisorClients = asyncHandler(async (req, res) => {
  // Only clients assigned to this supervisor
  const clients = await Client.find({ assignedSupervisorId: myId(req) })
    .select('fullName email companyName avatar createdAt verificationStatus clientId clientType')
    .sort({ createdAt: -1 })
    .lean();

  const enriched = await Promise.all(clients.map(async (c) => {
    const activeProjects = await Project.countDocuments({
      clientId: c._id,
      status: { $in: ['open', 'in_progress', 'under_review'] },
    });
    const totalProjects = await Project.countDocuments({ clientId: c._id });
    return { ...c, activeProjects, totalProjects };
  }));

  res.json(new ApiResponse(200, enriched, 'Portfolio clients fetched'));
});

// ── GET /supervisor/payouts ──────────────────────────────────────
export const getPayouts = asyncHandler(async (req, res) => {
  const payrolls = await Payroll.find({ supervisorId: myId(req) })
    .populate('projectId', 'title status totalAmount')
    .lean();

  res.json(new ApiResponse(200, payrolls, 'Payouts fetched'));
});

// ── POST /supervisor/payouts/:projectId/distribute ───────────────
export const distributePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findOne({ projectId: req.params.projectId });
  if (!payroll) throw new ApiError(404, 'Payroll not found');
  if (payroll.finalized) throw new ApiError(400, 'Payroll already finalized');

  // Mark all entries as paid and credit freelancer wallets
  for (const entry of payroll.entries) {
    entry.status = 'paid';
    entry.paidAt = new Date();

    await FreelancerWallet.findOneAndUpdate(
      { freelancerId: entry.recipientId },
      {
        $inc: { balance: entry.amount, totalEarned: entry.amount },
        $push: {
          transactions: {
            type: 'earning',
            amount: entry.amount,
            description: `Project payout`,
            projectId: payroll.projectId,
            status: 'completed',
          },
        },
      },
      { upsert: true }
    );
  }

  payroll.finalized = true;
  payroll.finalizedAt = new Date();
  await payroll.save();

  res.json(new ApiResponse(200, payroll, 'Payroll distributed'));
});

// ── GET /supervisor/earnings ─────────────────────────────────────
export const getSupervisorEarnings = asyncHandler(async (req, res) => {
  const wallet = await SupervisorWallet.findOne({ supervisorId: myId(req) }).lean();
  const payrolls = await Payroll.find({ supervisorId: myId(req), finalized: true })
    .populate('projectId', 'title totalAmount')
    .lean();

  res.json(new ApiResponse(200, {
    wallet: wallet || { balance: 0, totalEarned: 0, totalWithdrawn: 0, transactions: [] },
    payrolls,
  }, 'Earnings fetched'));
});

// ── GET /supervisor/wallet ───────────────────────────────────────
export const getSupervisorWallet = asyncHandler(async (req, res) => {
  let wallet = await SupervisorWallet.findOne({ supervisorId: myId(req) });
  if (!wallet) wallet = await SupervisorWallet.create({ supervisorId: myId(req) });
  res.json(new ApiResponse(200, wallet, 'Wallet fetched'));
});

// ── POST /supervisor/wallet/withdraw ────────────────────────────
export const supervisorWithdraw = asyncHandler(async (req, res) => {
  const { amount, method, accountDetails } = req.body;
  if (!amount || amount < 100) throw new ApiError(400, 'Minimum withdrawal is ₹100');

  const wallet = await SupervisorWallet.findOne({ supervisorId: myId(req) });
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

  res.json(new ApiResponse(200, { balance: wallet.balance }, 'Withdrawal requested'));
});

// ── GET /supervisor/notifications ───────────────────────────────
// Time-sensitive + consultancy projects that need attention
export const getSupervisorNotifications = asyncHandler(async (req, res) => {
  const urgent = await Project.find({
    $or: [
      { timeSensitive: true, status: { $in: ['open', 'in_progress'] } },
      { experienceFormat: 'priority', status: 'open' },
    ],
  })
    .populate('clientId', 'fullName company')
    .select('title timeSensitive experienceFormat status deadline clientId category')
    .sort({ timeSensitive: -1, createdAt: -1 })
    .limit(20)
    .lean();

  res.json(new ApiResponse(200, urgent, 'Notifications fetched'));
});
// ── GET /supervisor/verifications ────────────────────────────────
export const getVerificationRequests = asyncHandler(async (req, res) => {
  const requests = await Client.find({
    assignedSupervisorId: myId(req),
    verificationStatus: { $in: ['pending', 'on_hold'] }
  })
  .select('fullName email country phone address verificationStatus verificationSubmittedAt')
  .sort({ verificationSubmittedAt: 1 })
  .lean();

  res.json(new ApiResponse(200, requests, 'Verification requests fetched'));
});

// ── POST /supervisor/verify-client/:id ────────────────────────────
export const verifyClient = asyncHandler(async (req, res) => {
  const { status = 'verified' } = req.body; // allow 'verified' or 'unverified' (rejected)
  
  const client = await Client.findOne({ _id: req.params.id, assignedSupervisorId: myId(req) });
  if (!client) throw new ApiError(404, 'Verification request not found');

  client.verificationStatus = status;
  if (status === 'verified') {
    client.isVerified = true;
    // Set client type if provided by supervisor, otherwise default 'CG'
    if (req.body.clientType) {
      client.clientType = req.body.clientType;
    }
    // Generate only if not already set
    if (!client.clientId) {
      client.clientId = await generateClientId(client);
    }
  }
  await client.save();

  // Notify client
  await Notification.create({
    recipientId: client._id,
    recipientModel: 'Client',
    title: status === 'verified' ? 'Account Verified!' : 'Verification Update',
    message: status === 'verified' 
      ? 'Your account has been successfully verified. You now have full access.'
      : 'There was an issue with your verification. Please contact support.',
    type: 'system',
    link: '/client/dashboard'
  });

  res.json(new ApiResponse(200, client, `Client ${status}`));
});
