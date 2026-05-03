import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Project } from '../models/Project.js';
import { MicroTask } from '../models/MicroTask.js';
import { Payment } from '../models/Payment.js';
import { Client } from '../models/Client.js';
import { Wallet } from '../models/Wallet.js';
import { Pricing } from '../models/Pricing.js';
import { MomentumSupervisor } from '../models/MomentumSupervisor.js';
import { Notification } from '../models/Notification.js';
import { Coupon } from '../models/Coupon.js';

const PLATFORM_FEE_RATE     = 0.05;   // 5%
const TIME_SENSITIVE_RATE   = 0.60;   // +60%
const DEPOSIT_RATE          = 0.30;   // 30% upfront
const FIRST_PROJECT_DISCOUNT = 0.15;   // 15% discount for first project
const USD_MARKUP            = 1;      // 1:1 ratio for non-India clients (requested)

// Psychological pricing: rounds to X4.99 or X9.99
function psychoPrice(rawUsd) {
  const floor = Math.floor(rawUsd);
  const lastDigit = floor % 10;
  const base = Math.floor(floor / 10) * 10;
  if (lastDigit === 0) return parseFloat((floor - 0.01).toFixed(2));
  if (lastDigit >= 1 && lastDigit <= 4) return parseFloat((base + 4.99).toFixed(2));
  return parseFloat((base + 9.99).toFixed(2)); // 5–9
}

// ── Helper: get or create wallet ──────────────────────────────────
const getOrCreateWallet = async (clientId) => {
  let wallet = await Wallet.findOne({ clientId });
  if (!wallet) {
    const client = await Client.findById(clientId);
    const isIndia = (client?.country || 'IN').toUpperCase() === 'IN';
    wallet = await Wallet.create({ clientId, currency: isIndia ? 'INR' : 'USD' });
  }
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

// ── Notifications ─────────────────────────────────────────────────
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ 
    recipientId: req.user._id,
    recipientModel: 'Client'
  }).sort({ createdAt: -1 }).limit(20);
  
  res.json(new ApiResponse(200, notifications, 'Notifications retrieved'));
});

// ── Coupons ──────────────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  
  // Check if it's the user's first project
  const projectCount = await Project.countDocuments({ clientId: req.user._id });
  if (projectCount === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'Coupons cannot be applied to your first project (you already have an automatic 15% discount!)'));
  }

  if (!code) return res.status(400).json(new ApiResponse(400, null, 'Coupon code is required'));

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  
  if (!coupon) {
    return res.status(404).json(new ApiResponse(404, null, 'Invalid coupon code'));
  }

  if (coupon.isUsed) {
    return res.status(400).json(new ApiResponse(400, null, 'This coupon has already been used'));
  }

  if (new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json(new ApiResponse(400, null, 'This coupon has expired'));
  }

  if (amount && coupon.minPurchaseAmount > amount) {
    return res.status(400).json(new ApiResponse(400, null, `Minimum purchase of ₹${coupon.minPurchaseAmount} required`));
  }

  res.json(new ApiResponse(200, {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue
  }, 'Coupon applied successfully'));
});

// ── Create project ────────────────────────────────────────────────
export const createProject = asyncHandler(async (req, res) => {
  const {
    title, description, category, startDate, durationDays,
    timeSensitive, serviceId, serviceName, unit, quantity, ratePerUnit,
    isOpenProject, openBudget, openUnit,
    experienceFormat, preferredSoftware, referenceLinks, ndaRequired,
    couponCode,
  } = req.body;

  const countryCode = (req.cookies?.country_code || 'IN').toUpperCase();
  const isIndia = countryCode === 'IN';
  const projectCurrency = isIndia ? 'INR' : 'USD';

  let inrToUsd = 0.012;
  if (!isIndia) {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
      const data = await response.json();
      if (data?.rates?.USD) inrToUsd = data.rates.USD;
    } catch (err) {}
  }

  // Compute amounts
  let baseAmount = 0;
  if (isOpenProject) {
    baseAmount = openBudget || 0; // openBudget is already entered by user in their local currency
  } else {
    let rate = ratePerUnit || 0;
    if (!isIndia) {
      rate = rate * USD_MARKUP * inrToUsd;
    }
    baseAmount = rate * (quantity || 0);
  }

  // Apply psychological pricing for USD (round to X4.99 or X9.99)
  if (!isIndia) baseAmount = psychoPrice(baseAmount);
  else baseAmount = Math.ceil(baseAmount);

  const timeSensitiveFee = timeSensitive ? (isIndia ? Math.round(baseAmount * TIME_SENSITIVE_RATE) : parseFloat((baseAmount * TIME_SENSITIVE_RATE).toFixed(2))) : 0;
  const subtotal         = isIndia ? Math.round(baseAmount + timeSensitiveFee) : parseFloat((baseAmount + timeSensitiveFee).toFixed(2));

  // Check for first project discount eligibility
  const projectCount = await Project.countDocuments({ clientId: req.user._id });
  const isFirstProject = projectCount === 0 && !isOpenProject; // Discount usually applies to catalogue services
  const discount = isFirstProject ? (isIndia ? Math.round(subtotal * FIRST_PROJECT_DISCOUNT) : parseFloat((subtotal * FIRST_PROJECT_DISCOUNT).toFixed(2))) : 0;

  const discountedAmount = subtotal - discount;
  const platformFee      = isIndia ? Math.round(discountedAmount * PLATFORM_FEE_RATE) : parseFloat((discountedAmount * PLATFORM_FEE_RATE).toFixed(2));
  let totalAmount        = isIndia ? Math.round(discountedAmount + platformFee) : parseFloat((discountedAmount + platformFee).toFixed(2));

  // Apply Coupon if provided
  let couponDiscount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && !coupon.isUsed && new Date(coupon.expiryDate) > new Date()) {
      let cVal = coupon.discountValue;
      if (!isIndia && coupon.discountType === 'flat') {
         cVal = parseFloat((cVal * 1.4 * inrToUsd).toFixed(2));
      }
      if (coupon.discountType === 'percentage') {
        couponDiscount = isIndia ? Math.round(totalAmount * (coupon.discountValue / 100)) : parseFloat((totalAmount * (coupon.discountValue / 100)).toFixed(2));
      } else {
        couponDiscount = Math.min(cVal, totalAmount);
      }
      totalAmount -= couponDiscount;
      if (!isIndia) totalAmount = parseFloat(totalAmount.toFixed(2));
      appliedCoupon = coupon;
    }
  }

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
    discountAmount: discount,
    couponDiscount,
    appliedCouponCode: appliedCoupon?.code,
    isFirstProject,
    isOpenProject: !!isOpenProject,
    openBudget, openUnit,
    experienceFormat: experienceFormat || 'elite',
    preferredSoftware: preferredSoftware || [],
    referenceLinks: referenceLinks || [],
    ndaRequired: !!ndaRequired,
    budget: totalAmount,
    currency: projectCurrency,
  });

  // Mark coupon as used
  if (appliedCoupon) {
    appliedCoupon.isUsed = true;
    appliedCoupon.usedBy = req.user._id;
    appliedCoupon.usedAt = new Date();
    await appliedCoupon.save();
  }

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

// ── Verification: Submit ──────────────────────────────────────────
export const submitVerification = asyncHandler(async (req, res) => {
  const { country, phone, address } = req.body;
  if (!country || !phone || !address) {
    return res.status(400).json(new ApiResponse(400, null, 'All fields are required'));
  }

  const client = await Client.findById(req.user._id);
  if (!client) return res.status(404).json(new ApiResponse(404, null, 'Client not found'));

  // Logic: Find best supervisor
  let targetSupervisor = null;
  const onlineSupervisors = await MomentumSupervisor.find({ isOnline: true }).lean();
  
  if (onlineSupervisors.length > 0) {
    const counts = await Promise.all(onlineSupervisors.map(async (s) => {
      const clientCount = await Client.countDocuments({ assignedSupervisorId: s._id });
      return { id: s._id, count: clientCount };
    }));
    counts.sort((a, b) => a.count - b.count);
    targetSupervisor = counts[0].id;
  } else {
    const allSupervisors = await MomentumSupervisor.find({}).lean();
    if (allSupervisors.length > 0) {
      const counts = await Promise.all(allSupervisors.map(async (s) => {
        const clientCount = await Client.countDocuments({ assignedSupervisorId: s._id });
        return { id: s._id, count: clientCount };
      }));
      counts.sort((a, b) => a.count - b.count);
      targetSupervisor = counts[0].id;
    }
  }

  client.country = country;
  client.phone = phone;
  client.address = address;
  client.verificationStatus = 'pending';
  client.verificationSubmittedAt = new Date();
  client.assignedSupervisorId = targetSupervisor;
  await client.save();

  if (targetSupervisor) {
    await Notification.create({
      recipientId: targetSupervisor,
      recipientModel: 'MomentumSupervisor',
      title: 'New Client Verification Request',
      message: `${client.fullName} is waiting for verification.`,
      type: 'system',
      link: '/supervisor/verification-portal'
    });
  }

  res.json(new ApiResponse(200, client, 'Verification submitted. Please wait 5-10 minutes.'));
});

// ── Verification: Bypass ──────────────────────────────────────────
export const bypassVerification = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.user._id);
  if (!client) return res.status(404).json(new ApiResponse(404, null, 'Client not found'));

  if (client.verificationStatus !== 'pending') {
    return res.status(400).json(new ApiResponse(400, null, 'No pending verification to bypass'));
  }

  client.verificationStatus = 'on_hold';
  await client.save();

  res.json(new ApiResponse(200, client, 'Verification is now on hold. You can proceed for now.'));
});

