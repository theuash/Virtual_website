import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Project } from '../models/Project.js';
import { MicroTask } from '../models/MicroTask.js';
import { Payment } from '../models/Payment.js';
import { Client } from '../models/Client.js';
import { Wallet } from '../models/Wallet.js';
import { Pricing } from '../models/Pricing.js';

const PLATFORM_FEE_RATE    = 0.05;   // 5%
const TIME_SENSITIVE_RATE  = 0.60;   // +60%
const DEPOSIT_RATE         = 0.30;   // 30% upfront

// ── Helper: get or create wallet ──────────────────────────────────
const getOrCreateWallet = async (clientId) => {
  let wallet = await Wallet.findOne({ clientId });
  if (!wallet) wallet = await Wallet.create({ clientId });
  return wallet;
};

// ── Dashboard ─────────────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [client, projects, wallet] = await Promise.all([
    Client.findById(req.user._id),
    Project.find({ clientId: req.user._id }),
    getOrCreateWallet(req.user._id),
  ]);

  const stats = {
    activeProjects:    projects.filter(p => !['completed', 'cancelled'].includes(p.status)).length,
    totalSpent:        client.totalSpent,
    completedProjects: client.completedProjects,
    pendingApprovals:  projects.filter(p => p.status === 'under_review').length,
    walletBalance:     wallet.balance,
    escrowHeld:        wallet.escrowHeld,
  };

  const recentProjects = await Project.find({ clientId: req.user._id })
    .sort({ updatedAt: -1 }).limit(5);

  res.json(new ApiResponse(200, { stats, projects: recentProjects }, 'Dashboard stats retrieved'));
});

// ── Create project ────────────────────────────────────────────────
export const createProject = asyncHandler(async (req, res) => {
  const {
    title, description, category, startDate, durationDays,
    timeSensitive, serviceId, serviceName, unit, quantity, ratePerUnit,
    isOpenProject, openBudget, openUnit,
    experienceFormat, preferredSoftware, referenceLinks, ndaRequired,
  } = req.body;

  // Compute amounts
  let baseAmount = 0;
  if (isOpenProject) {
    baseAmount = openBudget || 0;
  } else {
    baseAmount = (ratePerUnit || 0) * (quantity || 0);
  }

  const timeSensitiveFee = timeSensitive ? Math.round(baseAmount * TIME_SENSITIVE_RATE) : 0;
  const subtotal         = baseAmount + timeSensitiveFee;
  const platformFee      = Math.round(subtotal * PLATFORM_FEE_RATE);
  const totalAmount      = subtotal + platformFee;

  // Compute deadline
  const start    = new Date(startDate);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + (durationDays || 7));

  const project = await Project.create({
    title, description, category,
    clientId: req.user._id,
    startDate: start,
    durationDays,
    deadline,
    timeSensitive: !!timeSensitive,
    serviceId, serviceName, unit, quantity, ratePerUnit,
    baseAmount, timeSensitiveFee, platformFee, totalAmount,
    isOpenProject: !!isOpenProject,
    openBudget, openUnit,
    experienceFormat: experienceFormat || 'elite',
    preferredSoftware: preferredSoftware || [],
    referenceLinks: referenceLinks || [],
    ndaRequired: !!ndaRequired,
    budget: totalAmount,
  });

  res.status(201).json(new ApiResponse(201, project, 'Project created'));
});

// ── Get projects ──────────────────────────────────────────────────
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ clientId: req.user._id }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, projects));
});

// ── Get project detail ────────────────────────────────────────────
export const getProjectDetail = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('assignedInitiatorId', 'fullName avatar tier')
    .populate({ path: 'microTasks', populate: { path: 'assignedTo', select: 'fullName avatar tier' } });
  if (!project) return res.status(404).json(new ApiResponse(404, null, 'Project not found'));
  res.json(new ApiResponse(200, project));
});

// ── Approve project ───────────────────────────────────────────────
export const approveProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, clientId: req.user._id },
    { clientApproved: true, status: 'completed' },
    { new: true }
  );
  if (!project) return res.status(404).json(new ApiResponse(404, null, 'Project not found'));
  res.json(new ApiResponse(200, project, 'Project approved'));
});

// ── Wallet: get ───────────────────────────────────────────────────
export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  res.json(new ApiResponse(200, wallet, 'Wallet fetched'));
});

// ── Wallet: add money (simulate — real payment gateway TBD) ───────
export const addMoneyToWallet = asyncHandler(async (req, res) => {
  const { amount, method } = req.body;
  if (!amount || amount <= 0) return res.status(400).json(new ApiResponse(400, null, 'Invalid amount'));
  if (!method) return res.status(400).json(new ApiResponse(400, null, 'Payment method required'));

  const wallet = await getOrCreateWallet(req.user._id);
  wallet.balance    += amount;
  wallet.totalAdded += amount;
  wallet.transactions.push({
    type: 'credit', amount, method,
    description: `Added ₹${amount} via ${method}`,
    status: 'completed',
  });
  await wallet.save();

  res.json(new ApiResponse(200, wallet, `₹${amount} added to wallet`));
});

// ── Wallet: pay deposit (30%) after initiator assigned ────────────
export const payDeposit = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, clientId: req.user._id });
  if (!project) return res.status(404).json(new ApiResponse(404, null, 'Project not found'));
  if (project.depositPaid) return res.status(400).json(new ApiResponse(400, null, 'Deposit already paid'));

  const depositAmount = Math.round(project.totalAmount * DEPOSIT_RATE);
  const wallet = await getOrCreateWallet(req.user._id);

  if (wallet.balance < depositAmount) {
    return res.status(400).json(new ApiResponse(400, null, `Insufficient wallet balance. Need ₹${depositAmount}`));
  }

  wallet.balance    -= depositAmount;
  wallet.escrowHeld += depositAmount;
  wallet.totalSpent += depositAmount;
  wallet.transactions.push({
    type: 'escrow_hold', amount: depositAmount,
    projectId: project._id,
    description: `30% deposit for "${project.title}"`,
    status: 'completed',
  });
  await wallet.save();

  project.depositPaid   = true;
  project.depositAmount = depositAmount;
  await project.save();

  res.json(new ApiResponse(200, { project, wallet }, 'Deposit paid and held in escrow'));
});

// ── Wallet: pay final amount on approval ──────────────────────────
export const payFinal = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, clientId: req.user._id });
  if (!project) return res.status(404).json(new ApiResponse(404, null, 'Project not found'));
  if (!project.depositPaid) return res.status(400).json(new ApiResponse(400, null, 'Deposit not paid yet'));
  if (project.finalPaid) return res.status(400).json(new ApiResponse(400, null, 'Final payment already made'));

  const revisionFee  = project.revisionFeeAmount || 0;
  const remaining    = project.totalAmount - project.depositAmount + revisionFee;
  const wallet       = await getOrCreateWallet(req.user._id);

  if (wallet.balance < remaining) {
    return res.status(400).json(new ApiResponse(400, null, `Insufficient balance. Need ₹${remaining}`));
  }

  wallet.balance    -= remaining;
  wallet.escrowHeld -= project.depositAmount;
  wallet.totalSpent += remaining;
  wallet.transactions.push({
    type: 'escrow_release', amount: remaining,
    projectId: project._id,
    description: `Final payment for "${project.title}"`,
    status: 'completed',
  });
  await wallet.save();

  project.finalPaid     = true;
  project.clientApproved = true;
  project.status        = 'completed';
  await project.save();

  res.json(new ApiResponse(200, { project, wallet }, 'Final payment made. Project complete.'));
});
