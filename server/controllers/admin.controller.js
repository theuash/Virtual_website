import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Dispute } from '../models/Dispute.js';
import { Payment } from '../models/Payment.js';
import { PromotionRequest } from '../models/PromotionRequest.js';

export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeProjects = await Project.countDocuments({ status: { $in: ['open', 'in_progress', 'under_review'] } });
  
  const payments = await Payment.find({ status: 'released' });
  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  
  const openDisputes = await Dispute.countDocuments({ status: 'open' });
  
  // Get recent 5 access logs/users
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt');
  const accessLogs = recentUsers.map(u => ({
    name: u.fullName, email: u.email, role: u.role, time: u.createdAt
  }));
  
  const recentIncidents = await Dispute.find({ status: 'open' }).sort({ createdAt: -1 }).limit(3);
  const incidents = recentIncidents.map(i => ({
    message: `Dispute raised on Project ${i.projectId}`,
    id: i._id
  }));

  const stats = { totalUsers, activeProjects, totalRevenue, openDisputes };

  res.json(new ApiResponse(200, { stats, accessLogs, incidents }, 'Admin stats fetched'));
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(new ApiResponse(200, users));
});

export const toggleUserSuspension = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json(new ApiResponse(200, user, `User ${user.isSuspended ? 'suspended' : 'activated'}`));
});
