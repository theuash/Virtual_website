import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Client } from '../../models/users/Client.js';
import { Freelancer } from '../../models/users/Freelancer.js';
import { MomentumSupervisor } from '../../models/users/MomentumSupervisor.js';
import { User } from '../../models/users/User.js';
import { Project } from '../../models/projects/Project.js';
import { Dispute } from '../../models/communication/Dispute.js';
import { Payment } from '../../models/finance/Payment.js';
import { PromotionRequest } from '../../models/learning/PromotionRequest.js';

export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [clients, freelancers, supervisors, admins] = await Promise.all([
    Client.countDocuments(),
    Freelancer.countDocuments(),
    MomentumSupervisor.countDocuments(),
    User.countDocuments(),
  ]);
  const totalUsers = clients + freelancers + supervisors + admins;

  const activeProjects = await Project.countDocuments({ status: { $in: ['open', 'in_progress', 'under_review'] } });
  const payments = await Payment.find({ status: 'released' });
  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const openDisputes = await Dispute.countDocuments({ status: 'open' });

  const [recentClients, recentFreelancers] = await Promise.all([
    Client.find().sort({ createdAt: -1 }).limit(3).select('fullName email role createdAt'),
    Freelancer.find().sort({ createdAt: -1 }).limit(3).select('fullName email role createdAt'),
  ]);
  const accessLogs = [...recentClients, ...recentFreelancers]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)
    .map(u => ({ name: u.fullName, email: u.email, role: u.role, time: u.createdAt }));

  const recentIncidents = await Dispute.find({ status: 'open' }).sort({ createdAt: -1 }).limit(3);
  const incidents = recentIncidents.map(i => ({ message: `Dispute raised on Project ${i.projectId}`, id: i._id }));

  res.json(new ApiResponse(200, { stats: { totalUsers, activeProjects, totalRevenue, openDisputes }, accessLogs, incidents }, 'Admin stats fetched'));
});

export const getUsers = asyncHandler(async (req, res) => {
  const [clients, freelancers, supervisors] = await Promise.all([
    Client.find().select('-passwordHash -otpCodeHash'),
    Freelancer.find().select('-passwordHash -otpCodeHash'),
    MomentumSupervisor.find().select('-passwordHash -otpCodeHash'),
  ]);
  res.json(new ApiResponse(200, { clients, freelancers, supervisors }));
});

export const toggleUserSuspension = asyncHandler(async (req, res) => {
  const { findUserById } = await import('../utils/findUser.js');
  const user = await findUserById(req.params.id);
  if (!user) return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json(new ApiResponse(200, user, `User ${user.isSuspended ? 'suspended' : 'activated'}`));
});
