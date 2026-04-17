import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Project } from '../models/Project.js';
import { MicroTask } from '../models/MicroTask.js';
import { Payment } from '../models/Payment.js';
import { Message } from '../models/Message.js';
import { Client } from '../models/Client.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.user._id);
  const projects = await Project.find({ clientId: req.user._id });
  const activeProjects = projects.filter(p => !['completed', 'cancelled'].includes(p.status)).length;
  
  const stats = {
    activeProjects,
    totalSpent: client.totalSpent,
    completedProjects: client.completedProjects,
    pendingApprovals: projects.filter(p => p.status === 'under_review').length
  };

  // Construct recent activity mock logic from actual data if needed, or return raw lists
  // For now, let's return latest projects
  const recentProjects = await Project.find({ clientId: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(5);

  res.json(new ApiResponse(200, { stats, projects: recentProjects }, 'Dashboard stats retrieved'));
});

export const createProject = asyncHandler(async (req, res) => {
  req.body.clientId = req.user._id;
  const project = await Project.create(req.body);
  res.status(201).json(new ApiResponse(201, project, 'Project created'));
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ clientId: req.user._id }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, projects));
});

export const getProjectDetail = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('assignedInitiatorId', 'fullName avatar')
    .populate({
      path: 'microTasks',
      populate: { path: 'assignedTo', select: 'fullName avatar tier' }
    });
  if (!project) return res.status(404).json(new ApiResponse(404, null, 'Project not found'));
  res.json(new ApiResponse(200, project));
});

export const approveProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, clientId: req.user._id },
    { clientApproved: true, status: 'completed' },
    { new: true }
  );
  if (!project) return res.status(404).json(new ApiResponse(404, null, 'Project not found'));
  
  // Logic to release escrow payment triggers here (abstracted via Payment service)
  res.json(new ApiResponse(200, project, 'Project approved'));
});
